from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import CropGrowth
from notifications.models import Notification

@shared_task
def check_upcoming_harvests():
    today = timezone.now().date()
    # Find active crops
    active_crops = CropGrowth.objects.exclude(crop_stage__in=['HARVESTED', 'SOLD_OUT'])
    
    for crop in active_crops:
        days_remaining = (crop.expected_harvest_date - today).days
        
        # 1. Notify Farmer
        if days_remaining == 7:
            Notification.objects.create(
                user=crop.farmer,
                notification_type='harvest_reminder',
                title=f"Harvest Approaching: {crop.product.name if crop.product else 'Crop'}",
                message=f"You have an upcoming harvest in 7 days."
            )
        elif days_remaining == 3:
            Notification.objects.create(
                user=crop.farmer,
                notification_type='harvest_reminder',
                title=f"Harvest Approaching: {crop.product.name if crop.product else 'Crop'}",
                message=f"You have an upcoming harvest in 3 days."
            )
        elif days_remaining == 0:
            Notification.objects.create(
                user=crop.farmer,
                notification_type='harvest_reminder',
                title=f"Harvest Day: {crop.product.name if crop.product else 'Crop'}",
                message=f"Today is the expected harvest day!"
            )
            
        # 2. Notify Followers 7 days before
        if days_remaining == 7:
            followers = crop.followers.all()
            for follower in followers:
                Notification.objects.create(
                    user=follower.buyer,
                    notification_type='buyer_alert',
                    title=f"Harvest in 7 Days: {crop.product.name if crop.product else 'Crop'}",
                    message=f"The crop you follow is expected to be harvested in 7 days. Be ready to order!"
                )
