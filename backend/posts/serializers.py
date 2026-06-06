from rest_framework import serializers
from .models import Post, Media, Comment, Like, Save, Share
from accounts.serializers import UserSerializer
from products.serializers import CategorySerializer, ProductSerializer

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ['id', 'type', 'file', 'thumbnail', 'order', 'created_at']

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies_count = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'user', 'parent', 'content', 'created_at', 'updated_at', 'replies_count']
        read_only_fields = ['user']

    def get_replies_count(self, obj):
        return obj.replies.count()

class PostSerializer(serializers.ModelSerializer):
    farmer = UserSerializer(read_only=True)
    product = ProductSerializer(read_only=True) # Full detail of pinned product
    media = MediaSerializer(many=True, read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    shares_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'farmer', 'product', 'category', 'title', 'description',
            'location', 'hashtags', 'visibility',
            'status', 'is_pinned', 'created_at', 'updated_at',
            'media', 'likes_count', 'comments_count', 'shares_count',
            'is_liked', 'is_saved'
        ]
        read_only_fields = ['farmer', 'product']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # We will use prefetch_related and annotations to optimize this,
            # but if not available we check query
            if hasattr(obj, 'is_liked_by_user'):
                return obj.is_liked_by_user
            return Like.objects.filter(post=obj, user=request.user).exists()
        return False

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if hasattr(obj, 'is_saved_by_user'):
                return obj.is_saved_by_user
            return Save.objects.filter(post=obj, user=request.user).exists()
        return False
