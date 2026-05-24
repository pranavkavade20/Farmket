from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Conversation, Message, MessageReaction
from .serializers import ConversationSerializer, MessageSerializer, MessageReactionSerializer

User = get_user_model()


class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user).prefetch_related(
            'participants', 'messages'
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def create(self, request, *args, **kwargs):
        """Get or create a 1:1 conversation with another user."""
        participant_ids = request.data.get('participants', [])
        if not participant_ids:
            return Response({'error': 'participants required'}, status=status.HTTP_400_BAD_REQUEST)

        other_user_id = participant_ids[0] if isinstance(participant_ids, list) else participant_ids
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Find existing 1:1 conversation
        existing = Conversation.objects.filter(
            participants=request.user, is_group=False
        ).filter(participants=other_user)

        if existing.exists():
            conv = existing.first()
            serializer = self.get_serializer(conv)
            return Response(serializer.data)

        # Create new conversation
        conv = Conversation.objects.create(is_group=False)
        conv.participants.add(request.user, other_user)
        serializer = self.get_serializer(conv)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        conversation = self.get_object()
        conversation.messages.exclude(sender=request.user).update(is_read=True)
        return Response({'status': 'messages marked as read'})

    @action(detail=False, methods=['get'])
    def search_users(self, request):
        """Search users to start a new conversation with."""
        q = request.query_params.get('q', '').strip()
        if len(q) < 2:
            return Response([])
        users = User.objects.filter(
            Q(username__icontains=q) | Q(first_name__icontains=q) | Q(last_name__icontains=q)
        ).exclude(id=request.user.id)[:20]

        data = []
        for u in users:
            pic = None
            if u.profile_picture:
                pic = request.build_absolute_uri(u.profile_picture.url)
            data.append({
                'id': u.id,
                'username': u.username,
                'full_name': f'{u.first_name} {u.last_name}'.strip() or u.username,
                'profile_picture': pic,
                'user_type': u.user_type,
            })
        return Response(data)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['created_at']

    def get_queryset(self):
        qs = Message.objects.filter(conversation__participants=self.request.user)
        conversation_id = self.request.query_params.get('conversation')
        if conversation_id:
            qs = qs.filter(conversation_id=conversation_id)
        return qs.select_related('sender', 'reply_to__sender').prefetch_related('reactions')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=True, methods=['post'])
    def react(self, request, pk=None):
        """Add or remove an emoji reaction on a message."""
        message = self.get_object()
        reaction_emoji = request.data.get('reaction')
        if not reaction_emoji:
            return Response({'error': 'reaction required'}, status=status.HTTP_400_BAD_REQUEST)

        obj, created = MessageReaction.objects.update_or_create(
            message=message,
            user=request.user,
            defaults={'reaction': reaction_emoji}
        )
        return Response({'status': 'created' if created else 'updated', 'reaction': reaction_emoji})

    @action(detail=True, methods=['delete'], url_path='unreact')
    def unreact(self, request, pk=None):
        """Remove a reaction from a message."""
        message = self.get_object()
        MessageReaction.objects.filter(message=message, user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], url_path='upload_media')
    def upload_media(self, request):
        """
        Upload media (image/video/audio/document) and create a message.
        Expected form fields: conversation (int), message_type (str), file (file), content (optional)
        """
        conv_id = request.data.get('conversation')
        msg_type = request.data.get('message_type', 'image')
        content = request.data.get('content', '')
        file_obj = request.FILES.get('file')

        if not conv_id or not file_obj:
            return Response({'error': 'conversation and file are required'}, status=400)

        try:
            conversation = Conversation.objects.get(id=conv_id, participants=request.user)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation not found'}, status=404)

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            message_type=msg_type,
            content=content,
        )

        if msg_type == 'image':
            message.image = file_obj
        elif msg_type == 'video':
            message.video = file_obj
        elif msg_type == 'audio':
            message.audio = file_obj
        elif msg_type == 'document':
            message.document = file_obj

        message.save()

        # Update conversation timestamp
        from django.utils import timezone
        conversation.updated_at = timezone.now()
        conversation.save(update_fields=['updated_at'])

        serializer = self.get_serializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MessageReactionViewSet(viewsets.ModelViewSet):
    serializer_class = MessageReactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MessageReaction.objects.filter(message__conversation__participants=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
