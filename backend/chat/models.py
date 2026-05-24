from django.db import models
from accounts.models import User
from django.db.models import Q
from django.utils import timezone

class Conversation(models.Model):
    participants = models.ManyToManyField(User, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_group = models.BooleanField(default=False)
    group_name = models.CharField(max_length=200, blank=True)
    group_icon = models.ImageField(upload_to='chat/group_icons/', blank=True, null=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        if self.is_group:
            return f"Group: {self.group_name}"
        return f"Conversation {self.id}"
    
    @property
    def last_message(self):
        return self.messages.first()
    
    def get_other_participant(self, user):
        return self.participants.exclude(id=user.id).first()
    
    def unread_count(self, user):
        return self.messages.filter(~Q(sender=user), is_read=False).count()

class Message(models.Model):
    MESSAGE_TYPE_CHOICES = (
        ('text', 'Text'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('document', 'Document'),
        ('location', 'Location'),
    )
    
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPE_CHOICES, default='text')
    content = models.TextField(blank=True)
    
    # Media files
    image = models.ImageField(upload_to='chat/images/', blank=True, null=True)
    video = models.FileField(upload_to='chat/videos/', blank=True, null=True)
    audio = models.FileField(upload_to='chat/audio/', blank=True, null=True)
    document = models.FileField(upload_to='chat/documents/', blank=True, null=True)
    
    # Location data
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    location_name = models.CharField(max_length=200, blank=True)
    
    # Message metadata
    is_read = models.BooleanField(default=False)
    is_edited = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    deleted_for_everyone = models.BooleanField(default=False)
    
    # Reply to message
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    
    # Delivery status
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['conversation', '-created_at']),
            models.Index(fields=['sender', '-created_at']),
        ]
    
    def __str__(self):
        return f"Message from {self.sender.username} - {self.message_type}"
    
    @property
    def file_url(self):
        if self.message_type == 'image' and self.image:
            return self.image.url
        elif self.message_type == 'video' and self.video:
            return self.video.url
        elif self.message_type == 'audio' and self.audio:
            return self.audio.url
        elif self.message_type == 'document' and self.document:
            return self.document.url
        return None
    
    @property
    def file_name(self):
        if self.message_type == 'document' and self.document:
            return self.document.name.split('/')[-1]
        return None

class MessageReceipt(models.Model):
    """Track message delivery and read status for each recipient"""
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='receipts')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('message', 'user')
    
    def __str__(self):
        return f"Receipt for {self.message.id} - {self.user.username}"

class TypingStatus(models.Model):
    """Track who is typing in a conversation"""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='typing_statuses')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_typing = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('conversation', 'user')
    
    def __str__(self):
        return f"{self.user.username} typing in {self.conversation.id}"

class MessageReaction(models.Model):
    """WhatsApp-style reactions to messages"""
    REACTION_CHOICES = (
        ('👍', 'Thumbs Up'),
        ('❤️', 'Heart'),
        ('😂', 'Laugh'),
        ('😮', 'Wow'),
        ('😢', 'Sad'),
        ('🙏', 'Pray'),
    )
    
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reaction = models.CharField(max_length=10, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('message', 'user')
    
    def __str__(self):
        return f"{self.user.username} reacted {self.reaction}"