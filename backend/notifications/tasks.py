from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Notification

# TODO: Rewrite these tasks with the new crops.models.CropGrowth model
# @shared_task
# def check_harvest_reminders():
#     pass

# @shared_task
# def check_buyer_alerts():
#     pass

# @shared_task
# def notify_buyers_on_harvest(crop_tracking_id):
#     pass
