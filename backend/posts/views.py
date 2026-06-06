from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import CursorPagination
from django.db.models import Count, Exists, OuterRef
from django.db import transaction

from .models import Post, Media, Comment, Like, Save, Share
from .serializers import PostSerializer, CommentSerializer, MediaSerializer
from .services import PostService

class PostCursorPagination(CursorPagination):
    page_size = 10
    ordering = '-created_at' # Needs to match an indexed field

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    pagination_class = PostCursorPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'location', 'hashtags__icontains']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'feed', 'farmer_posts']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()] # Only authenticated users for now

    def get_queryset(self):
        user = self.request.user
        qs = Post.objects.filter(status='active').select_related(
            'farmer', 'product', 'category'
        ).prefetch_related(
            'media'
        ).annotate(
            likes_count=Count('likes', distinct=True),
            comments_count=Count('comments', distinct=True),
            shares_count=Count('shares', distinct=True),
        )

        if user.is_authenticated:
            # Optimize is_liked and is_saved
            likes_subquery = Like.objects.filter(post=OuterRef('pk'), user=user)
            saves_subquery = Save.objects.filter(post=OuterRef('pk'), user=user)
            qs = qs.annotate(
                is_liked_by_user=Exists(likes_subquery),
                is_saved_by_user=Exists(saves_subquery)
            )

        return qs.order_by('-is_pinned', '-created_at')

    def create(self, request, *args, **kwargs):
        from accounts.permissions import IsFarmer
        if not IsFarmer().has_permission(request, self):
            return Response({"error": "Only farmers can create posts"}, status=status.HTTP_403_FORBIDDEN)
            
        data = request.data
        media_files = []
        
        # Handle multipart/form-data for media files
        for key in request.FILES:
            if key.startswith('media'):
                media_files.append({
                    'file': request.FILES[key],
                    'type': 'image' if request.FILES[key].content_type.startswith('image') else 'video' if request.FILES[key].content_type.startswith('video') else 'pdf'
                })
                
        try:
            post = PostService.create_post(request.user, data, media_files)
            # Re-fetch with annotations for proper serialization
            post = self.get_queryset().get(id=post.id)
            serializer = self.get_serializer(post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        post = self.get_object()
        if post.farmer != request.user:
            return Response({"error": "You don't have permission to edit this post."}, status=status.HTTP_403_FORBIDDEN)
            
        data = request.data
        media_to_delete = data.get('media_to_delete', [])
        if isinstance(media_to_delete, str):
            media_to_delete = [int(x) for x in media_to_delete.split(',') if x.strip()]
            
        new_media_files = []
        for key in request.FILES:
            if key.startswith('media'):
                new_media_files.append({
                    'file': request.FILES[key],
                    'type': 'image' if request.FILES[key].content_type.startswith('image') else 'video'
                })
                
        try:
            post = PostService.update_post(post, data, new_media_files, media_to_delete)
            post = self.get_queryset().get(id=post.id)
            serializer = self.get_serializer(post)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def my_posts(self, request):
        qs = self.get_queryset().filter(farmer=request.user)
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'])
    def saved_posts(self, request):
        saved_post_ids = Save.objects.filter(user=request.user).values_list('post_id', flat=True)
        qs = self.get_queryset().filter(id__in=saved_post_ids)
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post', 'delete'])
    def like(self, request, pk=None):
        post = self.get_object()
        if request.method == 'POST':
            like, created = Like.objects.get_or_create(post=post, user=request.user)
            return Response({'liked': True, 'is_liked': True}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        elif request.method == 'DELETE':
            Like.objects.filter(post=post, user=request.user).delete()
            return Response({'liked': False, 'is_liked': False}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post', 'delete'])
    def save_post(self, request, pk=None):
        post = self.get_object()
        if request.method == 'POST':
            save, created = Save.objects.get_or_create(post=post, user=request.user)
            return Response({'saved': True, 'is_saved': True}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        elif request.method == 'DELETE':
            Save.objects.filter(post=post, user=request.user).delete()
            return Response({'saved': False, 'is_saved': False}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        post = self.get_object()
        platform = request.data.get('platform', '')
        Share.objects.create(post=post, user=request.user, platform=platform)
        return Response({'shared': True})


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        post_id = self.request.query_params.get('post_id')
        qs = Comment.objects.select_related('user').filter(parent__isnull=True)
        if post_id:
            qs = qs.filter(post_id=post_id)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'])
    def replies(self, request, pk=None):
        comment = self.get_object()
        replies = Comment.objects.select_related('user').filter(parent=comment).order_by('created_at')
        serializer = self.get_serializer(replies, many=True)
        return Response(serializer.data)
