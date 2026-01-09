from django.db import models
from accounts.models import User
from products.models import Product
from django.core.validators import MinValueValidator
import uuid

class Cart(models.Model):
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Cart for {self.buyer.username}"
    
    @property
    def total_price(self):
        return sum(item.subtotal for item in self.items.all())

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('cart', 'product')
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
    
    @property
    def subtotal(self):
        return self.quantity * self.product.price

class Order(models.Model):
    # This status is now a "Summary" status
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'), # Partially or fully shipped
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    
    PAYMENT_CHOICES = (
        ('cod', 'Cash on Delivery'),
        ('online', 'Online Payment'),
        ('upi', 'UPI'),
    )
    
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField(max_length=50, unique=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_address = models.TextField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order {self.order_number}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def update_status_based_on_items(self):
        """Auto-calculate order status based on individual items"""
        items = self.items.all()
        if not items.exists():
            return

        statuses = [item.status for item in items]
        
        if all(s == 'delivered' for s in statuses):
            self.status = 'delivered'
        elif all(s == 'cancelled' for s in statuses):
            self.status = 'cancelled'
        elif any(s in ['shipped', 'out_for_delivery'] for s in statuses):
            self.status = 'shipped'
        elif any(s == 'confirmed' for s in statuses):
            self.status = 'processing'
        else:
            self.status = 'pending'
        self.save()

class OrderItem(models.Model):
    # Statuses specific to the item journey (Food Delivery style)
    ITEM_STATUS_CHOICES = (
        ('pending', 'Pending'),           # Waiting for Farmer to accept
        ('confirmed', 'Preparing'),       # Farmer Accepted / Packing
        ('shipped', 'Out for Delivery'),  # Farmer Handed over / Shipped
        ('delivered', 'Delivered'),       # Buyer Received
        ('cancelled', 'Cancelled'),       # Farmer or Buyer Cancelled
    )

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farmer_orders')
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=ITEM_STATUS_CHOICES, default='pending')
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
    
    @property
    def subtotal(self):
        if self.quantity is not None and self.price is not None:
            return self.quantity * self.price
        return 0