from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q, Max, Count
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone

from accounts.models import User
from .models import Conversation, Message, MessageReceipt, MessageReaction, TypingStatus

@login_required
def conversations_view(request):
    conversations = (
        Conversation.objects
        .filter(participants=request.user)
        .select_related()
        .prefetch_related('participants')
        .annotate(
            last_message_time=Max('messages__created_at'),
            unread_count=Count(
                'messages',
                filter=Q(messages__is_read=False) & ~Q(messages__sender=request.user)
            )
        )
        .order_by('-last_message_time')
    )

    for convo in conversations:
        other_user = convo.get_other_participant(request.user)
        convo.other_user = other_user

        # Attach profile safely
        if other_user.user_type == 'farmer':
            convo.profile = getattr(other_user, 'farmerprofile', None)
        elif other_user.user_type == 'buyer':
            convo.profile = getattr(other_user, 'buyerprofile', None)
        else:
            convo.profile = None

    return render(request, 'chat/conversations.html', {
        'conversations': conversations
    })

@login_required
def conversation_detail_view(request, conversation_id):
    """View a specific conversation with all messages"""
    conversation = get_object_or_404(Conversation, id=conversation_id, participants=request.user)
    
    # Get messages (paginated)
    messages_list = conversation.messages.filter(
        Q(deleted_for_everyone=False) | Q(sender=request.user)
    ).select_related('sender', 'reply_to', 'reply_to__sender').prefetch_related('reactions').order_by('created_at')
    
    # Mark messages as read
    unread_messages = messages_list.filter(~Q(sender=request.user), is_read=False)
    for msg in unread_messages:
        msg.is_read = True
        msg.read_at = timezone.now()  # Works now because import is global
    Message.objects.bulk_update(unread_messages, ['is_read', 'read_at'])
    
    # Update receipts
    # Note: I removed the inner import here that was causing your crash.
    MessageReceipt.objects.filter(
        message__conversation=conversation,
        user=request.user,
        read_at__isnull=True
    ).update(read_at=timezone.now())
    
    other_user = conversation.get_other_participant(request.user)
    
    # Check if other user is typing
    typing_status = TypingStatus.objects.filter(
        conversation=conversation,
        is_typing=True
    ).exclude(user=request.user).first()

    # Safely get profile (Farmer/Buyer specific)
    profile = None
    if other_user.user_type == 'farmer':
        profile = getattr(other_user, 'farmerprofile', None)
    elif other_user.user_type == 'buyer':
        profile = getattr(other_user, 'buyerprofile', None)

    context = {
        'conversation': conversation,
        'messages': messages_list,
        'other_user': other_user,
        'other_user_profile': profile,
        'is_other_user_typing': typing_status is not None if typing_status else False,
    }
    return render(request, 'chat/conversation_detail.html', context)

@login_required
def start_conversation_view(request, user_id):
    """Start a new conversation or redirect to existing one"""
    other_user = get_object_or_404(User, id=user_id)
    
    if other_user == request.user:
        messages.error(request, 'You cannot start a conversation with yourself.')
        return redirect('chat:conversations')
    
    # Check if conversation already exists
    conversation = Conversation.objects.filter(
        participants=request.user
    ).filter(
        participants=other_user
    ).filter(is_group=False).first()
    
    if not conversation:
        conversation = Conversation.objects.create()
        conversation.participants.add(request.user, other_user)
    
    return redirect('chat:conversation_detail', conversation_id=conversation.id)

@login_required
@require_http_methods(["POST"])
def send_message_view(request, conversation_id):
    """Send a text message (fallback for non-WebSocket)"""
    conversation = get_object_or_404(Conversation, id=conversation_id, participants=request.user)
    
    content = request.POST.get('content')
    if content:
        Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content,
            message_type='text'
        )
        conversation.updated_at = timezone.now()
        conversation.save()
    
    return redirect('chat:conversation_detail', conversation_id=conversation_id)

@login_required
@require_http_methods(["POST"])
def upload_media_view(request, conversation_id):
    """Upload media files via HTTP and broadcast to WebSocket"""
    conversation = get_object_or_404(Conversation, id=conversation_id, participants=request.user)
    
    media_type = request.POST.get('media_type', 'image')
    content = request.POST.get('content', '')
    
    # 1. Create the message
    message = Message.objects.create(
        conversation=conversation,
        sender=request.user,
        message_type=media_type,
        content=content
    )
    
    # 2. Handle the file upload
    if media_type == 'image' and request.FILES.get('image'):
        message.image = request.FILES['image']
    elif media_type == 'video' and request.FILES.get('video'):
        message.video = request.FILES['video']
    elif media_type == 'audio' and request.FILES.get('audio'):
        message.audio = request.FILES['audio']
    elif media_type == 'document' and request.FILES.get('document'):
        message.document = request.FILES['document']
    
    message.save()
    conversation.updated_at = timezone.now()
    conversation.save()

    # 3. Create receipt structure locally since this doesn't go through consumer
    message_data = {
        'id': message.id,
        'sender_id': request.user.id,
        'sender_username': request.user.username,
        'message_type': message.message_type,
        'content': message.content,
        'file_url': message.file_url,
        'file_name': message.file_name,
        'reply_to': message.reply_to.id if message.reply_to else None,
        'created_at': message.created_at.isoformat(),
        'is_edited': message.is_edited
    }

    # 4. Broadcast to WebSocket Group so it appears instantly for both users
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'chat_{conversation_id}',
        {
            'type': 'chat_message',
            'message': message_data
        }
    )
    
    return JsonResponse({
        'success': True,
        'message_id': message.id,
        'file_url': message.file_url
    })

@login_required
@require_http_methods(["POST"])
def delete_message_view(request, message_id):
    """Delete a message"""
    message = get_object_or_404(Message, id=message_id, sender=request.user)
    
    delete_for_everyone = request.POST.get('delete_for_everyone') == 'true'
    
    if delete_for_everyone:
        message.deleted_for_everyone = True
    message.is_deleted = True
    message.save()
    
    return JsonResponse({'success': True})

@login_required
@require_http_methods(["POST"])
def edit_message_view(request, message_id):
    """Edit a message"""
    message = get_object_or_404(Message, id=message_id, sender=request.user)
    
    new_content = request.POST.get('content')
    if new_content:
        message.content = new_content
        message.is_edited = True
        message.save()
    
    return JsonResponse({
        'success': True,
        'content': message.content
    })

@login_required
@require_http_methods(["POST"])
def react_to_message_view(request, message_id):
    """Add reaction to a message"""
    message = get_object_or_404(Message, id=message_id)
    reaction = request.POST.get('reaction')
    
    if reaction:
        MessageReaction.objects.update_or_create(
            message=message,
            user=request.user,
            defaults={'reaction': reaction}
        )
    
    return JsonResponse({'success': True})

@login_required
@require_http_methods(["POST"])
def remove_reaction_view(request, message_id):
    """Remove reaction from a message"""
    message = get_object_or_404(Message, id=message_id)
    
    MessageReaction.objects.filter(
        message=message,
        user=request.user
    ).delete()
    
    return JsonResponse({'success': True})

@login_required
def search_messages_view(request, conversation_id):
    """Search messages in a conversation"""
    conversation = get_object_or_404(Conversation, id=conversation_id, participants=request.user)
    
    query = request.GET.get('q', '')
    if query:
        messages_list = conversation.messages.filter(
            Q(content__icontains=query),
            deleted_for_everyone=False
        ).order_by('-created_at')
    else:
        messages_list = []
    
    context = {
        'conversation': conversation,
        'messages': messages_list,
        'search_query': query,
    }
    return render(request, 'chat/search_results.html', context)

@login_required
def get_conversation_info_view(request, conversation_id):
    """Get conversation information (for AJAX)"""
    conversation = get_object_or_404(Conversation, id=conversation_id, participants=request.user)
    
    other_user = conversation.get_other_participant(request.user)
    
    return JsonResponse({
        'id': conversation.id,
        'other_user': {
            'id': other_user.id,
            'username': other_user.username,
            'user_type': other_user.user_type,
        },
        'unread_count': conversation.unread_count(request.user),
        'last_message': {
            'content': conversation.last_message.content if conversation.last_message else '',
            'created_at': conversation.last_message.created_at.isoformat() if conversation.last_message else '',
        }
    })

@login_required
def mark_as_read_view(request, conversation_id):
    """Mark all messages in conversation as read"""
    conversation = get_object_or_404(Conversation, id=conversation_id, participants=request.user)
    
    messages_to_update = conversation.messages.filter(
        ~Q(sender=request.user),
        is_read=False
    )
    
    from django.utils import timezone
    messages_to_update.update(is_read=True, read_at=timezone.now())
    
    MessageReceipt.objects.filter(
        message__conversation=conversation,
        user=request.user,
        read_at__isnull=True
    ).update(read_at=timezone.now())
    
    return JsonResponse({'success': True})
