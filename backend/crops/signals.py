from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import CropGrowth, CropStageHistory, CropReservation, CropFollower
from notifications.models import Notification

@receiver(pre_save, sender=CropGrowth)
def track_stage_change(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = CropGrowth.objects.get(pk=instance.pk)
            if old_instance.stage != instance.stage:
                instance._previous_stage = old_instance.stage
                instance._stage_changed = True
        except CropGrowth.DoesNotExist:
            pass

@receiver(post_save, sender=CropGrowth)
def process_stage_change(sender, instance, created, **kwargs):
    if getattr(instance, '_stage_changed', False) or created:
        previous_stage = getattr(instance, '_previous_stage', None)
        
        # 1. Create history record
        CropStageHistory.objects.create(
            crop_growth=instance,
            previous_stage=previous_stage,
            current_stage=instance.stage,
            updated_by=getattr(instance, '_updated_by', instance.farmer),
            remarks=getattr(instance, '_stage_remarks', '')
        )
        
        # 2. Notify followers if stage changed
        if not created and previous_stage:
            followers = instance.followers.all()
            for follower in followers:
                Notification.objects.create(
                    user=follower.buyer,
                    notification_type='buyer_alert',
                    title=f"Crop Stage Updated: {instance.product.name if instance.product else 'Crop'}",
                    message=f"The stage changed from {previous_stage} to {instance.stage}."
                )
                
            # If ready for harvest or harvested, send specific alerts
            if instance.stage in ['NEAR_HARVEST', 'HARVESTED']:
                for follower in followers:
                    Notification.objects.create(
                        user=follower.buyer,
                        notification_type='buyer_alert',
                        title=f"Harvest Alert: {instance.product.name if instance.product else 'Crop'}",
                        message=f"The crop is now {instance.get_stage_display()}!"
                    )

@receiver(pre_save, sender=CropReservation)
def track_reservation_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = CropReservation.objects.get(pk=instance.pk)
            if old_instance.reservation_status != instance.reservation_status:
                instance._status_changed = True
        except CropReservation.DoesNotExist:
            pass

@receiver(post_save, sender=CropReservation)
def notify_reservation_status(sender, instance, created, **kwargs):
    if created:
        # Notify Farmer of new reservation
        Notification.objects.create(
            user=instance.crop_growth.farmer,
            notification_type='system',
            title='New Pre-Booking Request',
            message=f"{instance.buyer.username} wants to reserve {instance.quantity_reserved} of {instance.crop_growth.product.name}."
        )
    elif getattr(instance, '_status_changed', False):
        # Notify Buyer of status change
        Notification.objects.create(
            user=instance.buyer,
            notification_type='system',
            title='Reservation Status Updated',
            message=f"Your reservation for {instance.crop_growth.product.name} is now {instance.get_reservation_status_display()}."
        )
