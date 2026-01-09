from django.contrib import admin
from .models import Conversation, Message, MessageReceipt, TypingStatus, MessageReaction

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'is_group', 'group_name', 'created_at', 'updated_at']
    list_filter = ['is_group', 'created_at']
    search_fields = ['group_name']
    filter_horizontal = ['participants']
    date_hierarchy = 'created_at'

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'sender', 'message_type', 'is_read', 'is_deleted', 'created_at']
    list_filter = ['message_type', 'is_read', 'is_deleted', 'created_at']
    search_fields = ['content', 'sender__username']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'updated_at', 'delivered_at', 'read_at']

@admin.register(MessageReceipt)
class MessageReceiptAdmin(admin.ModelAdmin):
    list_display = ['message', 'user', 'delivered_at', 'read_at']
    list_filter = ['delivered_at', 'read_at']
    search_fields = ['user__username']

@admin.register(MessageReaction)
class MessageReactionAdmin(admin.ModelAdmin):
    list_display = ['message', 'user', 'reaction', 'created_at']
    list_filter = ['reaction', 'created_at']
    search_fields = ['user__username']

@admin.register(TypingStatus)
class TypingStatusAdmin(admin.ModelAdmin):
    list_display = ['conversation', 'user', 'is_typing', 'updated_at']
    list_filter = ['is_typing', 'updated_at']