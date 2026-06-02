from rest_framework import serializers
from .models import Conversation, Message, MessageReceipt, TypingStatus, MessageReaction
from accounts.serializers import UserSerializer

from django.conf import settings

MEDIA_BASE = settings.BACKEND_BASE_URL

class MessageReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageReaction
        fields = ['id', 'message', 'user', 'reaction', 'created_at']


class MessageReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageReceipt
        fields = ['id', 'user', 'delivered_at', 'read_at']


class MessageSerializer(serializers.ModelSerializer):
    sender_details = UserSerializer(source='sender', read_only=True)
    reactions = MessageReactionSerializer(many=True, read_only=True)
    file_url = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    reply_to_details = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_details',
            'message_type', 'content',
            'image', 'video', 'audio', 'document',
            'file_url', 'file_name',
            'latitude', 'longitude', 'location_name',
            'is_read', 'is_edited', 'is_deleted', 'deleted_for_everyone',
            'reply_to', 'reply_to_details',
            'reactions',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['sender', 'created_at', 'updated_at', 'file_url', 'file_name']

    def get_file_url(self, obj):
        request = self.context.get('request')
        url = obj.file_url
        if url and request:
            return request.build_absolute_uri(url)
        return url

    def get_file_name(self, obj):
        return obj.file_name

    def get_reply_to_details(self, obj):
        if obj.reply_to:
            return {
                'id': obj.reply_to.id,
                'content': obj.reply_to.content,
                'sender_name': obj.reply_to.sender.get_full_name() or obj.reply_to.sender.username,
                'message_type': obj.reply_to.message_type,
            }
        return None


class ConversationSerializer(serializers.ModelSerializer):
    participants_details = UserSerializer(source='participants', many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    group_icon_url = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'participants', 'participants_details',
            'created_at', 'updated_at',
            'is_group', 'group_name', 'group_icon', 'group_icon_url',
            'last_message', 'unread_count',
        ]

    def get_last_message(self, obj):
        msg = obj.messages.first()
        if msg:
            return MessageSerializer(msg, context=self.context).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.unread_count(request.user)
        return 0

    def get_group_icon_url(self, obj):
        request = self.context.get('request')
        if obj.group_icon and request:
            return request.build_absolute_uri(obj.group_icon.url)
        return None
