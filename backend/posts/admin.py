from django.contrib import admin
from .models import Post, Media, Comment, Like, Save, Share

class MediaInline(admin.TabularInline):
    model = Media
    extra = 1
    fields = ('type', 'file', 'thumbnail', 'order')

class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    fields = ('user', 'content', 'created_at')
    readonly_fields = ('created_at',)
    raw_id_fields = ('user',)
    # Prevent giant querysets loading if a post goes viral
    max_num = 10 
    show_change_link = True

from django import forms
from django.core.exceptions import ValidationError

class PostAdminForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        farmer = cleaned_data.get('farmer')
        product = cleaned_data.get('product')

        if farmer and product:
            if product.farmer != farmer:
                raise ValidationError({
                    'product': f"The selected product '{product.name}' belongs to {product.farmer.username}, not {farmer.username}."
                })
        return cleaned_data

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    form = PostAdminForm
    list_display = ('id', 'farmer', 'title_or_desc', 'status', 'visibility', 'is_pinned', 'created_at')
    list_filter = ('status', 'visibility', 'is_pinned', 'created_at')
    search_fields = ('farmer__username', 'farmer__first_name', 'farmer__last_name', 'title', 'description', 'location')
    
    # Use autocomplete_fields for a searchable dropdown instead of raw_id
    autocomplete_fields = ('farmer', 'category')
    
    date_hierarchy = 'created_at'
    
    # Optimize database queries by selecting related farmer
    list_select_related = ('farmer',) 
    
    inlines = [MediaInline, CommentInline]
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "farmer":
            # Only show users who are farmers
            kwargs["queryset"] = db_field.related_model.objects.filter(user_type='farmer')
            
        if db_field.name == "product":
            if request.resolver_match and 'object_id' in request.resolver_match.kwargs:
                # Editing existing post: strictly filter products by the assigned farmer
                post_id = request.resolver_match.kwargs['object_id']
                try:
                    post = Post.objects.get(pk=post_id)
                    kwargs["queryset"] = db_field.related_model.objects.filter(farmer=post.farmer)
                except Post.DoesNotExist:
                    pass
            else:
                # Creating new post: show all products, but we will validate in PostAdminForm
                # Because Django default code doesn't support live chained dropdowns
                pass
                
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('farmer', 'product', 'category', 'status', 'visibility', 'is_pinned')
        }),
        ('Content', {
            'fields': ('title', 'description', 'location', 'hashtags')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')

    def title_or_desc(self, obj):
        if obj.title:
            return obj.title
        return obj.description[:50] + '...' if obj.description else 'No Content'
    title_or_desc.short_description = 'Content Summary'


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ('id', 'post_link', 'type', 'order', 'created_at')
    list_filter = ('type', 'created_at')
    search_fields = ('post__id', 'post__title')
    raw_id_fields = ('post',)
    date_hierarchy = 'created_at'
    
    def post_link(self, obj):
        return f"Post #{obj.post_id}"
    post_link.short_description = 'Post'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'post_link', 'user', 'short_content', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'post__id', 'content')
    raw_id_fields = ('post', 'user', 'parent')
    date_hierarchy = 'created_at'
    list_select_related = ('user',)

    def post_link(self, obj):
        return f"Post #{obj.post_id}"
    post_link.short_description = 'Post'
    
    def short_content(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    short_content.short_description = 'Content'


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'post_link', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'post__id')
    raw_id_fields = ('post', 'user')
    date_hierarchy = 'created_at'
    list_select_related = ('user',)

    def post_link(self, obj):
        return f"Post #{obj.post_id}"
    post_link.short_description = 'Post'


@admin.register(Save)
class SaveAdmin(admin.ModelAdmin):
    list_display = ('id', 'post_link', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'post__id')
    raw_id_fields = ('post', 'user')
    date_hierarchy = 'created_at'
    list_select_related = ('user',)

    def post_link(self, obj):
        return f"Post #{obj.post_id}"
    post_link.short_description = 'Post'


@admin.register(Share)
class ShareAdmin(admin.ModelAdmin):
    list_display = ('id', 'post_link', 'user', 'platform', 'created_at')
    list_filter = ('platform', 'created_at')
    search_fields = ('user__username', 'post__id', 'platform')
    raw_id_fields = ('post', 'user')
    date_hierarchy = 'created_at'
    list_select_related = ('user',)

    def post_link(self, obj):
        return f"Post #{obj.post_id}"
    post_link.short_description = 'Post'
