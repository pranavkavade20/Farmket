import json
import logging
from django.db import transaction
from rest_framework.exceptions import ValidationError
from .models import Post, Media
from products.models import Product

logger = logging.getLogger(__name__)

def parse_bool(value, default=False):
    """
    Safely parse boolean values coming from JSON, Form-Data, or query params.
    Prevents Django BooleanField validation errors like ['“false” value must be either True or False.'].
    """
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        val_lower = value.strip().lower()
        if val_lower in ('true', '1', 't', 'yes'):
            return True
        if val_lower in ('false', '0', 'f', 'no', ''):
            return False
    return bool(value)

def parse_hashtags(data):
    """
    Extract and normalize hashtags from diverse request formats:
    - Direct list (from JSON payload)
    - JSON-encoded string: '["tag1", "tag2"]'
    - Comma-separated string: 'tag1, tag2'
    - Multi-value QueryDict: data.getlist('hashtags') or data.getlist('hashtags[]')
    - Form-Data indexed keys: hashtags[0], hashtags[1], ...
    Returns a list of clean hashtag strings, or None if no hashtag data was provided.
    """
    # 1. Direct 'hashtags' key
    if 'hashtags' in data:
        raw = data.get('hashtags')
        if hasattr(data, 'getlist'):
            items = data.getlist('hashtags')
            if len(items) > 1:
                return [str(tag).strip().lstrip('#') for tag in items if str(tag).strip()]
        if isinstance(raw, list):
            return [str(tag).strip().lstrip('#') for tag in raw if str(tag).strip()]
        if isinstance(raw, str):
            raw = raw.strip()
            if not raw:
                return []
            if raw.startswith('[') and raw.endswith(']'):
                try:
                    parsed = json.loads(raw)
                    if isinstance(parsed, list):
                        return [str(tag).strip().lstrip('#') for tag in parsed if str(tag).strip()]
                except Exception:
                    pass
            # Comma-separated or space-separated
            parts = [p.strip().lstrip('#') for p in raw.split(',') if p.strip()]
            if parts:
                return parts
            return [raw.lstrip('#')]

    # 2. 'hashtags[]' key
    if hasattr(data, 'getlist') and 'hashtags[]' in data:
        return [str(tag).strip().lstrip('#') for tag in data.getlist('hashtags[]') if str(tag).strip()]

    # 3. Indexed form-data keys like 'hashtags[0]', 'hashtags[1]'
    indexed_keys = [k for k in data.keys() if k.startswith('hashtags[')]
    if indexed_keys:
        indexed_tags = []
        for key in sorted(indexed_keys):
            val = data[key]
            if isinstance(val, str) and val.strip():
                indexed_tags.append(val.strip().lstrip('#'))
        return indexed_tags

    return None

class PostService:
    @staticmethod
    @transaction.atomic
    def create_post(farmer, data, media_files=None):
        # Extract and sanitize fields
        title = data.get('title', '')
        if isinstance(title, str):
            title = title.strip()

        description = data.get('description', '')
        if isinstance(description, str):
            description = description.strip()

        location = data.get('location', '')
        if isinstance(location, str):
            location = location.strip()

        visibility = data.get('visibility', 'public')
        status = data.get('status', 'active')
        is_pinned = parse_bool(data.get('is_pinned', False))

        hashtags = parse_hashtags(data)
        if hashtags is None:
            hashtags = []

        category_id = data.get('category_id')
        if category_id and str(category_id).strip() not in ('', 'null', 'undefined', 'None'):
            try:
                category_id = int(category_id)
            except ValueError:
                category_id = None
        else:
            category_id = None

        product_id = data.get('product_id')
        product_instance = None

        # Link an existing product if provided
        if product_id and str(product_id).strip() not in ('', 'null', 'undefined', 'None'):
            try:
                product_instance = Product.objects.get(id=int(product_id), farmer=farmer)
            except (Product.DoesNotExist, ValueError):
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
        # Update text & status fields
        for field in ['title', 'description', 'location', 'visibility', 'status']:
            if field in data:
                val = data[field]
                setattr(post_instance, field, val.strip() if isinstance(val, str) else val)

        if 'is_pinned' in data:
            post_instance.is_pinned = parse_bool(data['is_pinned'])

        parsed_tags = parse_hashtags(data)
        if parsed_tags is not None:
            post_instance.hashtags = parsed_tags

        if 'category_id' in data:
            cat_id = data['category_id']
            if cat_id and str(cat_id).strip() not in ('', 'null', 'undefined', 'None'):
                try:
                    post_instance.category_id = int(cat_id)
                except ValueError:
                    post_instance.category_id = None
            else:
                post_instance.category_id = None

        if 'product_id' in data:
            product_id = data['product_id']
            if product_id and str(product_id).strip() not in ('', 'null', 'undefined', 'None'):
                try:
                    product_instance = Product.objects.get(id=int(product_id), farmer=post_instance.farmer)
                    post_instance.product = product_instance
                except (Product.DoesNotExist, ValueError):
                    raise ValidationError({"product_id": "You can only pin your own products."})
            else:
                post_instance.product = None

        post_instance.save()

        # Handle media deletion
        if media_to_delete:
            del_ids = []
            if isinstance(media_to_delete, str):
                del_ids = [int(x.strip()) for x in media_to_delete.split(',') if x.strip().isdigit()]
            elif isinstance(media_to_delete, (list, tuple)):
                for item in media_to_delete:
                    if isinstance(item, int):
                        del_ids.append(item)
                    elif isinstance(item, str) and item.strip().isdigit():
                        del_ids.append(int(item.strip()))
            if del_ids:
                Media.objects.filter(id__in=del_ids, post=post_instance).delete()

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
