from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem, OrderStatusHistory
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

class OrderStatusHistorySerializer(serializers.ModelSerializer):
    updated_by_name = serializers.SerializerMethodField()

    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'previous_status', 'new_status', 'timestamp', 'updated_by', 'updated_by_name']

    def get_updated_by_name(self, obj):
        if obj.updated_by:
            name = f"{obj.updated_by.first_name} {obj.updated_by.last_name}".strip()
            return name or obj.updated_by.username
        return 'System'

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    price_at_purchase = serializers.DecimalField(source='price', max_digits=10, decimal_places=2, read_only=True)
    product_details = ProductSerializer(source='product', read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    crop_growth_details = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id', 'order', 'product', 'product_name', 'product_details', 
            'farmer', 'quantity', 'price', 'price_at_purchase', 'status', 
            'subtotal', 'is_prebooking', 'crop_growth', 'crop_growth_details',
            'status_history'
        ]
        read_only_fields = ['order', 'price', 'status']

    def get_crop_growth_details(self, obj):
        if obj.is_prebooking and obj.crop_growth:
            growth = obj.crop_growth
            return {
                'id': growth.id,
                'current_stage': growth.current_stage,
                'expected_harvest_date': str(growth.expected_harvest_date) if growth.expected_harvest_date else None,
                'sow_date': str(growth.sow_date) if growth.sow_date else None,
            }
        return None

class OrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    buyer_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'buyer', 'buyer_details', 'order_number', 'status', 'payment_method', 
            'total_amount', 'delivery_address', 'notes', 'created_at', 
            'updated_at', 'items'
        ]
        read_only_fields = ['buyer', 'order_number', 'total_amount', 'created_at', 'updated_at', 'status']

    def get_buyer_details(self, obj):
        buyer = obj.buyer
        if not buyer:
            return None
        profile = getattr(buyer, 'buyer_profile', None)
        full_name = f"{buyer.first_name} {buyer.last_name}".strip() or buyer.username
        return {
            'id': buyer.id,
            'username': buyer.username,
            'full_name': full_name,
            'email': buyer.email,
            'phone_number': buyer.phone_number,
            'profile_picture': buyer.profile_picture.url if buyer.profile_picture else None,
            'address': buyer.address or (profile.delivery_address if profile else ''),
            'company_name': profile.company_name if profile else None,
        }

    def get_items(self, obj):
        request = self.context.get('request')
        items = obj.items.all()
        
        if request and request.user.is_authenticated and not request.user.is_staff:
            if obj.buyer != request.user:
                items = [item for item in items if item.farmer == request.user]
                
        return OrderItemSerializer(items, many=True).data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        if request and request.user.is_authenticated and not request.user.is_staff:
            if instance.buyer != request.user:
                farmer_items = [item for item in instance.items.all() if item.farmer == request.user]
                
                if not farmer_items:
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
