from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from .models import Cart, CartItem, Order, OrderItem, OrderStatusHistory
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer, OrderItemSerializer
from products.models import Product


class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    def get_permissions(self):
        from accounts.permissions import IsBuyer
        return [permissions.IsAuthenticated(), IsBuyer()]

    def get_queryset(self):
        return Cart.objects.filter(buyer=self.request.user)

    def get_object(self):
        cart, _ = Cart.objects.get_or_create(buyer=self.request.user)
        # Fix N+1 queries when serializing the cart
        cart = Cart.objects.prefetch_related(
            'items__product__images',
            'items__product__reviews',
            'items__product__category',
            'items__product__farmer'
        ).get(id=cart.id)
        return cart

    def list(self, request, *args, **kwargs):
        """Return the single cart for this user (same shape as retrieve)."""
        cart = self.get_object()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @transaction.atomic
    @action(detail=False, methods=['post'], url_path='add-item')
    def add_item(self, request):
        cart = self.get_object()
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(id=product_id, is_available=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found or unavailable'}, status=status.HTTP_404_NOT_FOUND)

        is_prebooking = request.data.get('is_prebooking', False)
        
        if is_prebooking:
            growth = product.active_crop_growth
            if not growth:
                return Response({'error': 'Product is not available for prebooking'}, status=status.HTTP_400_BAD_REQUEST)
            if float(growth.available_quantity) < quantity:
                return Response({'error': 'Not enough reservable quantity available'}, status=status.HTTP_400_BAD_REQUEST)
                
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': quantity, 'is_prebooking': True, 'crop_growth': growth},
            )
            if not created:
                if float(growth.available_quantity) < (cart_item.quantity + quantity):
                    return Response({'error': 'Not enough reservable quantity available'}, status=status.HTTP_400_BAD_REQUEST)
                cart_item.quantity += quantity
                cart_item.is_prebooking = True
                cart_item.crop_growth = growth
                cart_item.save()
        else:
            if product.stock_quantity < quantity:
                return Response({'error': 'Not enough stock available'}, status=status.HTTP_400_BAD_REQUEST)

            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': quantity, 'is_prebooking': False},
            )
            if not created:
                if product.stock_quantity < (cart_item.quantity + quantity):
                    return Response({'error': 'Not enough stock available'}, status=status.HTTP_400_BAD_REQUEST)
                cart_item.quantity += quantity
                cart_item.is_prebooking = False
                cart_item.save()

        serializer = CartItemSerializer(cart_item)
        return_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(serializer.data, status=return_status)


class CartItemViewSet(viewsets.ModelViewSet):
    """Allows PATCH quantity update and DELETE removal of individual cart items."""
    serializer_class = CartItemSerializer
    def get_permissions(self):
        from accounts.permissions import IsBuyer
        return [permissions.IsAuthenticated(), IsBuyer()]

    def get_queryset(self):
        return CartItem.objects.filter(cart__buyer=self.request.user)

    def update(self, request, *args, **kwargs):
        quantity = request.data.get('quantity')
        if quantity is not None:
            instance = self.get_object()
            try:
                quantity = int(quantity)
                if instance.is_prebooking and instance.crop_growth:
                    if float(instance.crop_growth.available_quantity) < quantity:
                        return Response({'error': 'Not enough reservable quantity available'}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    if instance.product.stock_quantity < quantity:
                        return Response({'error': 'Not enough stock available'}, status=status.HTTP_400_BAD_REQUEST)
            except ValueError:
                pass
        return super().update(request, *args, **kwargs)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    def get_permissions(self):
        from accounts.permissions import IsBuyer
        if self.action in ['create', 'cancel', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsBuyer()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        return (
            Order.objects.filter(buyer=user) |
            Order.objects.filter(items__farmer=user)
        ).distinct()

    @transaction.atomic
    def perform_create(self, serializer):
        user = self.request.user

        # Fetch buyer's cart
        try:
            cart = Cart.objects.get(buyer=user)
        except Cart.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError('Your cart is empty.')

        cart_items = cart.items.select_related('product', 'product__farmer').all()
        if not cart_items.exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError('Your cart is empty.')

        # Calculate total
        total_amount = sum(item.subtotal for item in cart_items)

        order = serializer.save(buyer=user, total_amount=total_amount)

        # Create OrderItems from cart items
        for ci in cart_items:
            product = ci.product
            
            if ci.is_prebooking:
                growth = ci.crop_growth
                if not growth or float(growth.available_quantity) < ci.quantity:
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError(f"Not enough reservable quantity for {product.name}")
                
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
                # Deduct stock
                if product.stock_quantity < ci.quantity:
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError(f"Not enough stock for {product.name}")
                
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

        # Clear the cart after order is placed
        cart_items.delete()

    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status not in ('pending', 'processing'):
            return Response(
                {'error': 'Only pending or processing orders can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        with transaction.atomic():
            for item in order.items.all():
                if item.status not in ('shipped', 'delivered', 'cancelled'):
                    OrderStatusHistory.objects.create(
                        order_item=item,
                        previous_status=item.status,
                        new_status='cancelled',
                        updated_by=request.user
                    )
                    item.status = 'cancelled'
                    item.save()
            
            order.update_status_based_on_items()
            
        return Response(OrderSerializer(order).data)


class OrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return OrderItem.objects.all()
        return OrderItem.objects.filter(farmer=user) | OrderItem.objects.filter(order__buyer=user)
        
    @action(detail=True, methods=['post'])
    def transition_status(self, request, pk=None):
        item = self.get_object()
        new_status = request.data.get('status')
        user = request.user
        
        if not new_status:
            return Response({'error': 'Status is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Role validation
        if new_status in ['processing', 'shipped']:
            if item.farmer != user:
                return Response({'error': 'Only the farmer who owns this product can update this status.'}, status=status.HTTP_403_FORBIDDEN)
        elif new_status == 'delivered':
            if item.order.buyer != user:
                return Response({'error': 'Only the buyer who placed the order can confirm delivery.'}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({'error': 'Invalid status transition.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Transition validation
        valid_transitions = {
            'pending': ['processing'],
            'processing': ['shipped'],
            'shipped': ['delivered']
        }
        
        allowed_next = valid_transitions.get(item.status, [])
        if new_status not in allowed_next:
            return Response({'error': f"Cannot transition from {item.status} to {new_status}."}, status=status.HTTP_400_BAD_REQUEST)
            
        with transaction.atomic():
            OrderStatusHistory.objects.create(
                order_item=item,
                previous_status=item.status,
                new_status=new_status,
                updated_by=user
            )
            item.status = new_status
            item.save()
            item.order.update_status_based_on_items()
            
        return Response(OrderItemSerializer(item).data)