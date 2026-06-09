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
    items = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'buyer', 'order_number', 'status', 'payment_method', 
            'total_amount', 'delivery_address', 'notes', 'created_at', 
            'updated_at', 'items'
        ]
        read_only_fields = ['buyer', 'order_number', 'total_amount', 'created_at', 'updated_at', 'status']

    def get_items(self, obj):
        request = self.context.get('request')
        items = obj.items.all()
        
        if request and request.user.is_authenticated and not request.user.is_staff:
            if obj.buyer != request.user:
                items = items.filter(farmer=request.user)
                
        return OrderItemSerializer(items, many=True).data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        if request and request.user.is_authenticated and not request.user.is_staff:
            if instance.buyer != request.user:
                farmer_items = instance.items.filter(farmer=request.user)
                
                if not farmer_items.exists():
                    return data
                    
                farmer_total = sum(item.subtotal for item in farmer_items)
                data['total_amount'] = str(farmer_total)
                
                statuses = [item.status for item in farmer_items]
                
                if all(s == 'delivered' for s in statuses):
                    data['status'] = 'delivered'
                elif all(s == 'cancelled' for s in statuses):
                    data['status'] = 'cancelled'
                elif any(s in ['shipped', 'out_for_delivery'] for s in statuses):
                    data['status'] = 'shipped'
                elif any(s == 'processing' for s in statuses):
                    data['status'] = 'processing'
                else:
                    data['status'] = 'pending'
                    
        return data
