from django.db import transaction
from .models import Post, Media
from products.models import Product

class PostService:
    @staticmethod
    @transaction.atomic
    def create_post(farmer, data, media_files=None):
        # Extract fields
        title = data.get('title', '')
        description = data.get('description', '')
        category_id = data.get('category_id')
        location = data.get('location', '')
        hashtags = data.get('hashtags', [])
        visibility = data.get('visibility', 'public')
        status = data.get('status', 'active')
        is_pinned = data.get('is_pinned', False)
        product_id = data.get('product_id')

        product_instance = None

        # Link an existing product if provided
        if product_id:
            try:
                product_instance = Product.objects.get(id=product_id, farmer=farmer)
            except Product.DoesNotExist:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"product_id": "You can only pin your own products."})

        # Create Post
        post = Post.objects.create(
            farmer=farmer,
            product=product_instance,
            category_id=category_id,
            title=title,
            description=description,
            location=location,
            hashtags=hashtags,
            visibility=visibility,
            status=status,
            is_pinned=is_pinned
        )

        # Handle media files
        if media_files:
            for index, file_data in enumerate(media_files):
                Media.objects.create(
                    post=post,
                    file=file_data['file'],
                    type=file_data.get('type', 'image'),
                    thumbnail=file_data.get('thumbnail', None),
                    order=index
                )

        return post

    @staticmethod
    @transaction.atomic
    def update_post(post_instance, data, new_media_files=None, media_to_delete=None):
        # Update Post fields
        for field in ['title', 'description', 'location', 'hashtags', 'visibility', 'status', 'is_pinned']:
            if field in data:
                setattr(post_instance, field, data[field])
        
        if 'category_id' in data:
            post_instance.category_id = data['category_id']

        if 'product_id' in data:
            product_id = data['product_id']
            if product_id:
                try:
                    product_instance = Product.objects.get(id=product_id, farmer=post_instance.farmer)
                    post_instance.product = product_instance
                except Product.DoesNotExist:
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError({"product_id": "You can only pin your own products."})
            else:
                post_instance.product = None

        post_instance.save()

        # Handle media deletion
        if media_to_delete:
            Media.objects.filter(id__in=media_to_delete, post=post_instance).delete()

        # Handle new media files
        if new_media_files:
            existing_count = post_instance.media.count()
            for index, file_data in enumerate(new_media_files):
                Media.objects.create(
                    post=post_instance,
                    file=file_data['file'],
                    type=file_data.get('type', 'image'),
                    thumbnail=file_data.get('thumbnail', None),
                    order=existing_count + index
                )

        return post_instance
