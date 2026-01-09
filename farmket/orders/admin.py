# In orders/admin.py

from django.contrib import admin
from django.utils.html import format_html
from .models import Order, OrderItem, Cart, CartItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    # Use 'get_subtotal' instead of 'subtotal' to avoid conflict
    readonly_fields = ['product', 'farmer', 'quantity', 'price', 'get_subtotal']
    fields = ['product', 'farmer', 'quantity', 'price', 'get_subtotal', 'status']
    can_delete = False
    
    # Safe getter for the admin display
    def get_subtotal(self, obj):
        return obj.subtotal
    get_subtotal.short_description = 'Subtotal'

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'buyer', 'colored_status', 'payment_method', 'total_amount', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['order_number', 'buyer__username', 'buyer__email', 'delivery_address']
    inlines = [OrderItemInline]
    date_hierarchy = 'created_at'
    readonly_fields = ['order_number', 'created_at', 'updated_at']
    
    def colored_status(self, obj):
        colors = {
            'pending': 'orange',
            'processing': 'blue',
            'shipped': 'purple',
            'delivered': 'green',
            'cancelled': 'red',
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'black'),
            obj.get_status_display()
        )
    colored_status.short_description = 'Status'

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order_link', 'product', 'farmer', 'item_status', 'quantity', 'price']
    
    # FIXED: referencing order__created_at instead of created_at
    list_filter = ['status', 'farmer', 'order__created_at'] 
    
    search_fields = ['order__order_number', 'product__name', 'farmer__username']
    autocomplete_fields = ['order', 'product', 'farmer']
    
    def order_link(self, obj):
        return obj.order.order_number
    order_link.short_description = 'Order #'

    def item_status(self, obj):
        colors = {
            'pending': 'orange',
            'confirmed': 'blue',
            'shipped': 'purple',
            'delivered': 'green',
            'cancelled': 'red',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 6px; border-radius: 3px;">{}</span>',
            colors.get(obj.status, 'gray'),
            obj.get_status_display()
        )
    item_status.short_description = 'Item Status'

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'buyer', 'item_count', 'total_price', 'created_at']
    search_fields = ['buyer__username']
    # Removing Inline if it causes issues, or keep CartItemInline if defined
    
    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = 'Items'