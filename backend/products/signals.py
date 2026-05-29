from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import CropTracking, CropStatusHistory

@receiver(pre_save, sender=CropTracking)
def check_status_change(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = CropTracking.objects.get(pk=instance.pk)
            if old_instance.current_stage != instance.current_stage:
                instance._status_changed = True
        except CropTracking.DoesNotExist:
            pass

@receiver(post_save, sender=CropTracking)
def create_status_history(sender, instance, created, **kwargs):
    if created or getattr(instance, '_status_changed', False):
        CropStatusHistory.objects.create(
            crop_tracking=instance,
            status=instance.current_stage,
            notes=instance.notes
        )
        
        # If changed to harvested, we can trigger notification task
        if instance.current_stage == 'harvested':
            from notifications.tasks import notify_buyers_on_harvest
            notify_buyers_on_harvest.delay(instance.id)
            
        if hasattr(instance, '_status_changed'):
            delattr(instance, '_status_changed')
