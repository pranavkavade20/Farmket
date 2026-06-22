from django.db import transaction
from rest_framework.exceptions import ValidationError
from orders.models import Cart, OrderItem

class OrderService:
    @staticmethod
    @transaction.atomic
    def create_order_from_cart(user, serializer):
        try:
            cart = Cart.objects.get(buyer=user)
        except Cart.DoesNotExist:
            raise ValidationError('Your cart is empty.')

        cart_items = cart.items.select_related('product', 'product__farmer').all()
        if not cart_items.exists():
            raise ValidationError('Your cart is empty.')

        total_amount = sum(item.subtotal for item in cart_items)
        order = serializer.save(buyer=user, total_amount=total_amount)

        for ci in cart_items:
            product = ci.product
            
            if ci.is_prebooking:
                growth = ci.crop_growth
                if not growth or float(growth.available_quantity) < ci.quantity:
                    raise ValidationError({'detail': f"Not enough reservable quantity for {product.name}"})
                
                growth.available_quantity = float(growth.available_quantity) - ci.quantity
                growth.save()

                from crops.models import CropReservation
                CropReservation.objects.create(
                    buyer=user,
                    crop_growth=growth,
                    quantity_reserved=ci.quantity,
                    expected_delivery_date=growth.expected_harvest_date,
                    order=order
                )

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    farmer=product.farmer,
                    quantity=ci.quantity,
                    price=product.price,
                    status='pending',
                    is_prebooking=True,
                    crop_growth=growth
                )
            else:
                if product.stock_quantity < ci.quantity:
                    raise ValidationError({'detail': f"Not enough stock for {product.name}"})
                
                product.stock_quantity -= ci.quantity
                product.save()

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    farmer=product.farmer,
                    quantity=ci.quantity,
                    price=product.price,
                    status='pending',
                    is_prebooking=False
                )

        cart_items.delete()
        return order
