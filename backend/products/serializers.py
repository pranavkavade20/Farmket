from rest_framework import serializers
from .models import Category, Product, ProductImage, Review

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Category
        fields = '__all__'
        read_only_fields = ['slug']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary', 'uploaded_at']

class ReviewSerializer(serializers.ModelSerializer):
    buyer_name = serializers.ReadOnlyField(source='buyer.username')
    
    class Meta:
        model = Review
        fields = ['id', 'buyer', 'buyer_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['buyer', 'created_at']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    farmer_name = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    market_state = serializers.ReadOnlyField()
    crop_stage = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    harvest_countdown = serializers.SerializerMethodField()
    reservation_count = serializers.SerializerMethodField()
    reserved_quantity = serializers.SerializerMethodField()
    available_quantity = serializers.SerializerMethodField()
    is_prebookable = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    active_crop_growth_id = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'farmer', 'farmer_name', 'category', 'category_name', 
            'name', 'slug', 'description', 'price', 'unit', 'stock_quantity', 
            'minimum_order', 'is_organic', 'harvest_date', 'is_available', 
            'views', 'created_at', 'updated_at', 'images', 'reviews', 'in_stock',
            'market_state', 'crop_stage', 'progress_percentage', 'harvest_countdown',
            'reservation_count', 'reserved_quantity', 'available_quantity', 'is_prebookable',
            'is_following', 'active_crop_growth_id'
        ]
        read_only_fields = ['slug', 'views', 'created_at', 'updated_at', 'farmer']

    def get_farmer_name(self, obj):
        name = obj.farmer.get_full_name()
        return name if name else obj.farmer.username

    def get_crop_stage(self, obj):
        growth = obj.active_crop_growth
        return growth.stage if growth else None

    def get_progress_percentage(self, obj):
        growth = obj.active_crop_growth
        return growth.progress_percentage if growth else 0.0

    def get_harvest_countdown(self, obj):
        growth = obj.active_crop_growth
        if growth and growth.expected_harvest_date:
            from django.utils import timezone
            days = (growth.expected_harvest_date - timezone.now().date()).days
            return days if days > 0 else 0
        return 0

    def get_reservation_count(self, obj):
        growth = obj.active_crop_growth
        if growth:
            return growth.reservations.filter(reservation_status__in=['PENDING', 'CONFIRMED']).count()
        return 0

    def get_reserved_quantity(self, obj):
        growth = obj.active_crop_growth
        if growth:
            from django.db.models import Sum
            res = growth.reservations.filter(reservation_status__in=['PENDING', 'CONFIRMED']).aggregate(Sum('quantity_reserved'))
            return float(res['quantity_reserved__sum']) if res['quantity_reserved__sum'] else 0.0
        return 0.0

    def get_available_quantity(self, obj):
        growth = obj.active_crop_growth
        return float(growth.available_quantity) if growth else 0.0

    def get_is_prebookable(self, obj):
        return obj.market_state == 'READY_FOR_PREBOOKING'

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            growth = obj.active_crop_growth
            if growth:
                return growth.followers.filter(buyer=request.user).exists()
        return False

    def get_active_crop_growth_id(self, obj):
        growth = obj.active_crop_growth
        return growth.id if growth else None
