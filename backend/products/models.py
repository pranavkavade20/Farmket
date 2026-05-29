from django.db import models
from accounts.models import User
from django.core.validators import MinValueValidator
from django.utils.text import slugify

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Product(models.Model):
    UNIT_CHOICES = (
        ('kg', 'Kilogram'),
        ('g', 'Gram'),
        ('l', 'Liter'),
        ('unit', 'Unit'),
        ('dozen', 'Dozen'),
    )
    
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='kg')
    stock_quantity = models.IntegerField(validators=[MinValueValidator(0)])
    minimum_order = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    is_organic = models.BooleanField(default=False)
    harvest_date = models.DateField(null=True, blank=True)
    is_available = models.BooleanField(default=True)
    views = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['category']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.name}-{self.farmer.username}")
        super().save(*args, **kwargs)
    
    @property
    def in_stock(self):
        return self.stock_quantity > 0

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-is_primary', 'uploaded_at']
    
    def __str__(self):
        return f"Image for {self.product.name}"

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(validators=[MinValueValidator(1)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ('product', 'buyer')
    
    
    def __str__(self):
        return f"Review by {self.buyer.username} for {self.product.name}"

class CropTracking(models.Model):
    STATUS_CHOICES = (
        ('sown', 'Sown'),
        ('growing', 'Growing'),
        ('ready_for_harvest', 'Ready for Harvest'),
        ('harvested', 'Harvested'),
    )
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='crop_tracking')
    sow_date = models.DateField()
    expected_harvest_date = models.DateField()
    current_stage = models.CharField(max_length=20, choices=STATUS_CHOICES, default='sown')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-expected_harvest_date']
        
    def __str__(self):
        return f"{self.product.name} Tracking"

class CropStatusHistory(models.Model):
    crop_tracking = models.ForeignKey(CropTracking, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20, choices=CropTracking.STATUS_CHOICES)
    changed_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-changed_at']
        verbose_name_plural = 'Crop Status Histories'

class BuyerCropInterest(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='buyer_interests')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='crop_interests')
    subscribed_at = models.DateTimeField(auto_now_add=True)
    notified = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('product', 'buyer')
        
class HarvestReminderLog(models.Model):
    REMINDER_TYPES = (
        ('7_days', '7 Days Before'),
        ('3_days', '3 Days Before'),
        ('0_days', 'Harvest Day'),
    )
    crop_tracking = models.ForeignKey(CropTracking, on_delete=models.CASCADE, related_name='reminders_sent')
    reminder_type = models.CharField(max_length=10, choices=REMINDER_TYPES)
    sent_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('crop_tracking', 'reminder_type')