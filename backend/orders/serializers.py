from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from products.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'cart', 'product', 'product_details', 'quantity', 'added_at', 'subtotal']
        read_only_fields = ['cart', 'added_at']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'buyer', 'created_at', 'items', 'total_price']
        read_only_fields = ['buyer', 'created_at']

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    price_at_purchase = serializers.DecimalField(source='price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'product', 'product_name', 'farmer', 'quantity', 'price', 'price_at_purchase', 'status', 'subtotal']
        read_only_fields = ['order', 'price', 'status']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'buyer', 'order_number', 'status', 'payment_method', 
            'total_amount', 'delivery_address', 'notes', 'created_at', 
            'updated_at', 'items'
        ]
        read_only_fields = ['buyer', 'order_number', 'total_amount', 'created_at', 'updated_at', 'status']
