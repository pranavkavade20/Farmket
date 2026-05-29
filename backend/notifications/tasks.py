from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from products.models import CropTracking, HarvestReminderLog, BuyerCropInterest
from .models import Notification

@shared_task
def check_harvest_reminders():
    today = timezone.now().date()
    # Find crops not harvested yet
    active_crops = CropTracking.objects.exclude(current_stage='harvested')
    
    for crop in active_crops:
        days_remaining = (crop.expected_harvest_date - today).days
        
        # Auto-update to ready_for_harvest if within 7 days
        if 0 <= days_remaining <= 7 and crop.current_stage == 'growing':
            crop.current_stage = 'ready_for_harvest'
            crop.save()
            
        reminder_type = None
        if days_remaining == 7:
            reminder_type = '7_days'
        elif days_remaining == 3:
            reminder_type = '3_days'
        elif days_remaining == 0:
            reminder_type = '0_days'
            
        if reminder_type:
            # Check if reminder already sent
            if not HarvestReminderLog.objects.filter(crop_tracking=crop, reminder_type=reminder_type).exists():
                Notification.objects.create(
                    user=crop.product.farmer,
                    notification_type='harvest_reminder',
                    title=f"Harvest Reminder: {crop.product.name}",
                    message=f"Your crop {crop.product.name} is expected to be harvested in {days_remaining} days." if days_remaining > 0 else f"Today is the expected harvest day for {crop.product.name}!"
                )
                HarvestReminderLog.objects.create(crop_tracking=crop, reminder_type=reminder_type)

@shared_task
def check_buyer_alerts():
    today = timezone.now().date()
    # 5 days before harvest notify buyers
    target_date = today + timedelta(days=5)
    
    crops_nearing_harvest = CropTracking.objects.filter(expected_harvest_date=target_date, current_stage__in=['growing', 'ready_for_harvest'])
    
    for crop in crops_nearing_harvest:
        interests = BuyerCropInterest.objects.filter(product=crop.product, notified=False)
        for interest in interests:
            Notification.objects.create(
                user=interest.buyer,
                notification_type='buyer_alert',
                title=f"Crop Availability Alert: {crop.product.name}",
                message=f"The crop {crop.product.name} you are interested in is expected to be harvested in 5 days!"
            )
            interest.notified = True
            interest.save()

@shared_task
def notify_buyers_on_harvest(crop_tracking_id):
    crop = CropTracking.objects.get(id=crop_tracking_id)
    # Notify all buyers interested
    interests = BuyerCropInterest.objects.filter(product=crop.product)
    for interest in interests:
        Notification.objects.create(
            user=interest.buyer,
            notification_type='buyer_alert',
            title=f"Crop Available Now: {crop.product.name}",
            message=f"{crop.product.name} has been marked as harvested and is now available!"
        )
        interest.notified = True
        interest.save()
