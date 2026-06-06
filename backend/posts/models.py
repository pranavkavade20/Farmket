from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from products.models import Product, Category
from decimal import Decimal

class Post(models.Model):
    VISIBILITY_CHOICES = (
        ('public', 'Public'),
        ('followers', 'Followers Only'),
        ('private', 'Private'),
    )
    
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('draft', 'Draft'),
        ('sold', 'Sold Out'),
        ('archived', 'Archived'),
    )

    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts', limit_choices_to={'user_type': 'farmer'})
    product = models.OneToOneField(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='post')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    
    title = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    hashtags = models.JSONField(default=list, blank=True) # Storing tags as a list of strings
    
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='public')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_pinned = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_pinned', '-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['farmer']),
            models.Index(fields=['status']),
            models.Index(fields=['visibility']),
        ]

    def __str__(self):
        return f"Post by {self.farmer.username} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"

class Media(models.Model):
    TYPE_CHOICES = (
        ('image', 'Image'),
        ('video', 'Video'),
        ('pdf', 'PDF Document'),
        ('doc', 'Document'),
    )
    
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='media')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='image')
    file = models.FileField(upload_to='post_media/%Y/%m/')
    thumbnail = models.ImageField(upload_to='post_thumbnails/%Y/%m/', null=True, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.type} for Post {self.post.id}"

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.user.username} on Post {self.post.id}"

class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'user')

    def __str__(self):
        return f"{self.user.username} liked Post {self.post.id}"

class Save(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='saves')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_posts')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} saved Post {self.post.id}"

class Share(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='shares')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    platform = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Post {self.post.id} shared"
