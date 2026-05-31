from django.db import models
from accounts.models import User
from products.models import Product
from django.utils import timezone
from datetime import timedelta

class CropGrowth(models.Model):
    STAGE_CHOICES = (
        ('PLANNED', 'Planned'),
        ('SOWN', 'Sown'),
        ('GERMINATION', 'Germination'),
        ('VEGETATIVE', 'Vegetative'),
        ('FLOWERING', 'Flowering'),
        ('FRUITING', 'Fruiting'),
        ('READY_FOR_HARVEST', 'Ready for Harvest'),
        ('HARVESTED', 'Harvested'),
        ('SOLD_OUT', 'Sold Out'),
    )

    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='crop_growths')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='crop_growths')
    sowing_date = models.DateField()
    expected_harvest_date = models.DateField()
    actual_harvest_date = models.DateField(null=True, blank=True)
    expected_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    available_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    crop_stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='PLANNED')
    organic = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-expected_harvest_date']

    def __str__(self):
        return f"{self.product.name if self.product else 'Unknown Crop'} - {self.farmer.username}"

    @property
    def progress_percentage(self):
        if self.crop_stage in ['HARVESTED', 'SOLD_OUT']:
            return 100.0
        
        today = timezone.now().date()
        days_elapsed = (today - self.sowing_date).days
        total_days = (self.expected_harvest_date - self.sowing_date).days
        
        if total_days <= 0:
            return 100.0 if days_elapsed >= 0 else 0.0
            
        progress = (days_elapsed / total_days) * 100
        return max(0.0, min(100.0, progress))

class CropStageHistory(models.Model):
    crop_growth = models.ForeignKey(CropGrowth, on_delete=models.CASCADE, related_name='stage_history')
    previous_stage = models.CharField(max_length=20, choices=CropGrowth.STAGE_CHOICES, null=True, blank=True)
    current_stage = models.CharField(max_length=20, choices=CropGrowth.STAGE_CHOICES)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    remarks = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'Crop Stage Histories'

class CropReservation(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    )

    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='crop_reservations')
    crop_growth = models.ForeignKey(CropGrowth, on_delete=models.CASCADE, related_name='reservations')
    quantity_reserved = models.DecimalField(max_digits=10, decimal_places=2)
    reservation_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    reserved_at = models.DateTimeField(auto_now_add=True)
    expected_delivery_date = models.DateField(null=True, blank=True)
    order = models.ForeignKey('orders.Order', on_delete=models.SET_NULL, null=True, blank=True, related_name='crop_reservations')

    class Meta:
        ordering = ['-reserved_at']

class CropFollower(models.Model):
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followed_crops')
    crop_growth = models.ForeignKey(CropGrowth, on_delete=models.CASCADE, related_name='followers')
    followed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('buyer', 'crop_growth')

class Waitlist(models.Model):
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='waitlisted_crops')
    crop_growth = models.ForeignKey(CropGrowth, on_delete=models.CASCADE, related_name='waitlist_entries')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    notified = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']
        unique_together = ('buyer', 'crop_growth')

    def __str__(self):
        return f"{self.buyer.username} waiting for {self.crop_growth}"
