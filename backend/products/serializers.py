from rest_framework import serializers
from .models import Category, Product, ProductImage, Review, CropTracking, CropStatusHistory, BuyerCropInterest
from accounts.serializers import UserSerializer

class CategorySerializer(serializers.ModelSerializer):
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
    farmer_name = serializers.ReadOnlyField(source='farmer.username')
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'farmer', 'farmer_name', 'category', 'category_name', 
            'name', 'slug', 'description', 'price', 'unit', 'stock_quantity', 
            'minimum_order', 'is_organic', 'harvest_date', 'is_available', 
            'views', 'created_at', 'updated_at', 'images', 'reviews', 'in_stock'
        ]
        read_only_fields = ['slug', 'views', 'created_at', 'updated_at', 'farmer']

class CropStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CropStatusHistory
        fields = '__all__'
        read_only_fields = ['changed_at']

class CropTrackingSerializer(serializers.ModelSerializer):
    status_history = CropStatusHistorySerializer(many=True, read_only=True)
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = CropTracking
        fields = '__all__'
        read_only_fields = ['product', 'current_stage', 'created_at', 'updated_at']

    def validate(self, data):
        # Ensure harvest date is after sow date
        if data.get('sow_date') and data.get('expected_harvest_date'):
            if data['expected_harvest_date'] <= data['sow_date']:
                raise serializers.ValidationError("Harvest date must be after sow date.")
        return data

class BuyerCropInterestSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    buyer_name = serializers.ReadOnlyField(source='buyer.username')

    class Meta:
        model = BuyerCropInterest
        fields = '__all__'
        read_only_fields = ['product', 'buyer', 'subscribed_at', 'notified']
