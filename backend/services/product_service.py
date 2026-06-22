from rest_framework.exceptions import ValidationError
from django.db import transaction

class ProductService:
    @staticmethod
    @transaction.atomic
    def reserve_crop(user, product, quantity_requested, expected_delivery_date=None):
        growth = product.active_crop_growth
        if not growth:
            raise ValidationError({'detail': 'No active crop growth'})
        
        if hasattr(user, 'is_farmer') and user.is_farmer and user == growth.farmer:
            raise ValidationError({'detail': 'Farmers cannot reserve their own crops'})
            
        quantity_requested = float(quantity_requested)
        if quantity_requested <= 0:
            raise ValidationError({'detail': 'Quantity must be greater than 0'})
            
        if quantity_requested > float(growth.available_quantity):
            raise ValidationError({'detail': 'Requested quantity exceeds available quantity'})
            
        from crops.models import CropReservation
        reservation = CropReservation.objects.create(
            buyer=user,
            crop_growth=growth,
            quantity_reserved=quantity_requested,
            expected_delivery_date=expected_delivery_date or growth.expected_harvest_date
        )
        
        growth.available_quantity = float(growth.available_quantity) - quantity_requested
        growth.save()
        return reservation

    @staticmethod
    def waitlist_crop(user, product, quantity_requested):
        growth = product.active_crop_growth
        if not growth:
            raise ValidationError({'detail': 'No active crop growth'})
            
        quantity_requested = float(quantity_requested)
        if quantity_requested <= 0:
            raise ValidationError({'detail': 'Quantity must be greater than 0'})
            
        from crops.models import Waitlist
        waitlist, created = Waitlist.objects.get_or_create(
            buyer=user,
            crop_growth=growth,
            defaults={'quantity': quantity_requested}
        )
        if not created:
            waitlist.quantity = quantity_requested
            waitlist.save()
        return waitlist
