import json
import base64
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Conversation, Message, MessageReceipt, TypingStatus, MessageReaction

User = get_user_model()

class EnhancedChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        self.user = self.scope['user']
        
        # Join conversation group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send online status
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_status',
                'user_id': self.user.id,
                'username': self.user.username,
                'status': 'online'
            }
        )
    
    async def disconnect(self, close_code):
        # Send offline status
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_status',
                'user_id': self.user.id,
                'username': self.user.username,
                'status': 'offline'
            }
        )
        
        # Leave conversation group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'chat_message':
            await self.handle_chat_message(data)
        elif message_type == 'typing_status':
            await self.handle_typing_status(data)
        elif message_type == 'message_read':
            await self.handle_message_read(data)
        elif message_type == 'message_reaction':
            await self.handle_message_reaction(data)
        elif message_type == 'delete_message':
            await self.handle_delete_message(data)
        elif message_type == 'edit_message':
            await self.handle_edit_message(data)
    
    async def handle_chat_message(self, data):
        content = data.get('message', '')
        reply_to_id = data.get('reply_to')
        media_type = data.get('media_type', 'text')
        media_data = data.get('media_data')
        location_data = data.get('location')
        
        # Save message to database
        message = await self.save_message(
            content=content,
            media_type=media_type,
            media_data=media_data,
            reply_to_id=reply_to_id,
            location_data=location_data
        )
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )
    
    async def handle_typing_status(self, data):
        is_typing = data.get('is_typing', False)
        
        await self.update_typing_status(is_typing)
        
        # Broadcast typing status
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_status',
                'user_id': self.user.id,
                'username': self.user.username,
                'is_typing': is_typing
            }
        )
    
    async def handle_message_read(self, data):
        message_id = data.get('message_id')
        
        await self.mark_message_read(message_id)
        
        # Broadcast read receipt
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'message_read',
                'message_id': message_id,
                'user_id': self.user.id,
                'read_at': timezone.now().isoformat()
            }
        )
    
    async def handle_message_reaction(self, data):
        message_id = data.get('message_id')
        reaction = data.get('reaction')
        
        reaction_data = await self.add_reaction(message_id, reaction)
        
        # Broadcast reaction
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'message_reaction',
                'message_id': message_id,
                'user_id': self.user.id,
                'username': self.user.username,
                'reaction': reaction
            }
        )
    
    async def handle_delete_message(self, data):
        message_id = data.get('message_id')
        delete_for_everyone = data.get('delete_for_everyone', False)
        
        await self.delete_message(message_id, delete_for_everyone)
        
        # Broadcast deletion
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'message_deleted',
                'message_id': message_id,
                'delete_for_everyone': delete_for_everyone,
                'user_id': self.user.id
            }
        )
    
    async def handle_edit_message(self, data):
        message_id = data.get('message_id')
        new_content = data.get('content')
        
        updated_message = await self.edit_message(message_id, new_content)
        
        # Broadcast edit
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'message_edited',
                'message_id': message_id,
                'content': new_content,
                'user_id': self.user.id
            }
        )
    
    # WebSocket event handlers
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))
    
    async def typing_status(self, event):
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing_status',
                'user_id': event['user_id'],
                'username': event['username'],
                'is_typing': event['is_typing']
            }))
    
    async def message_read(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_read',
            'message_id': event['message_id'],
            'user_id': event['user_id'],
            'read_at': event['read_at']
        }))
    
    async def message_reaction(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_reaction',
            'message_id': event['message_id'],
            'user_id': event['user_id'],
            'username': event['username'],
            'reaction': event['reaction']
        }))
    
    async def message_deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_deleted',
            'message_id': event['message_id'],
            'delete_for_everyone': event['delete_for_everyone'],
            'user_id': event['user_id']
        }))
    
    async def message_edited(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_edited',
            'message_id': event['message_id'],
            'content': event['content'],
            'user_id': event['user_id']
        }))
    
    async def user_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user_id': event['user_id'],
            'username': event['username'],
            'status': event['status']
        }))
    
    # Database operations
    @database_sync_to_async
    def save_message(self, content, media_type, media_data, reply_to_id, location_data):
        conversation = Conversation.objects.get(id=self.conversation_id)
        
        message = Message.objects.create(
            conversation=conversation,
            sender=self.user,
            message_type=media_type,
            content=content
        )
        
        # Handle media files
        if media_data and media_type in ['image', 'video', 'audio', 'document']:
            # Decode base64 data
            format, imgstr = media_data.split(';base64,')
            ext = format.split('/')[-1]
            
            file_data = ContentFile(base64.b64decode(imgstr), name=f'{message.id}.{ext}')
            
            if media_type == 'image':
                message.image = file_data
            elif media_type == 'video':
                message.video = file_data
            elif media_type == 'audio':
                message.audio = file_data
            elif media_type == 'document':
                message.document = file_data
            
            message.save()
        
        # Handle location
        if location_data:
            message.latitude = location_data.get('latitude')
            message.longitude = location_data.get('longitude')
            message.location_name = location_data.get('name', '')
            message.save()
        
        # Handle reply
        if reply_to_id:
            try:
                reply_to_message = Message.objects.get(id=reply_to_id)
                message.reply_to = reply_to_message
                message.save()
            except Message.DoesNotExist:
                pass
        
        # Update conversation timestamp
        conversation.updated_at = timezone.now()
        conversation.save()
        
        # Create receipts for other participants
        participants = conversation.participants.exclude(id=self.user.id)
        for participant in participants:
            MessageReceipt.objects.create(
                message=message,
                user=participant
            )
        
        return {
            'id': message.id,
            'sender_id': self.user.id,
            'sender_username': self.user.username,
            'message_type': message.message_type,
            'content': message.content,
            'file_url': message.file_url,
            'file_name': message.file_name,
            'reply_to': message.reply_to.id if message.reply_to else None,
            'created_at': message.created_at.isoformat(),
            'is_edited': message.is_edited
        }
    
    @database_sync_to_async
    def update_typing_status(self, is_typing):
        TypingStatus.objects.update_or_create(
            conversation_id=self.conversation_id,
            user=self.user,
            defaults={'is_typing': is_typing}
        )
    
    @database_sync_to_async
    def mark_message_read(self, message_id):
        try:
            message = Message.objects.get(id=message_id)
            message.is_read = True
            message.read_at = timezone.now()
            message.save()
            
            # Update receipt
            MessageReceipt.objects.filter(
                message=message,
                user=self.user
            ).update(read_at=timezone.now())
        except Message.DoesNotExist:
            pass
    
    @database_sync_to_async
    def add_reaction(self, message_id, reaction):
        try:
            message = Message.objects.get(id=message_id)
            reaction_obj, created = MessageReaction.objects.update_or_create(
                message=message,
                user=self.user,
                defaults={'reaction': reaction}
            )
            return {'created': created}
        except Message.DoesNotExist:
            return None
    
    @database_sync_to_async
    def delete_message(self, message_id, delete_for_everyone):
        try:
            message = Message.objects.get(id=message_id, sender=self.user)
            if delete_for_everyone:
                message.deleted_for_everyone = True
            message.is_deleted = True
            message.save()
        except Message.DoesNotExist:
            pass
    
    @database_sync_to_async
    def edit_message(self, message_id, new_content):
        try:
            message = Message.objects.get(id=message_id, sender=self.user)
            message.content = new_content
            message.is_edited = True
            message.save()
            return {'success': True}
        except Message.DoesNotExist:
            return {'success': False}