from rest_framework import serializers
from .models import Category, Product, ProductImage, Review
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
