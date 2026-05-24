from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer, OrderItemSerializer
from products.models import Product


class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(buyer=self.request.user)

    def get_object(self):
        cart, _ = Cart.objects.get_or_create(buyer=self.request.user)
        return cart

    def list(self, request, *args, **kwargs):
        """Return the single cart for this user (same shape as retrieve)."""
        cart = self.get_object()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart = self.get_object()
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(id=product_id, is_available=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found or unavailable'}, status=status.HTTP_404_NOT_FOUND)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity},
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        serializer = CartItemSerializer(cart_item)
        return_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(serializer.data, status=return_status)


class CartItemViewSet(viewsets.ModelViewSet):
    """Allows PATCH quantity update and DELETE removal of individual cart items."""
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(cart__buyer=self.request.user)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

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
            OrderItem.objects.create(
                order=order,
                product=ci.product,
                farmer=ci.product.farmer,
                quantity=ci.quantity,
                price=ci.product.price,
                status='pending',
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
        order.status = 'cancelled'
        order.save()
        return Response(OrderSerializer(order).data)


class OrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return OrderItem.objects.all()
        return OrderItem.objects.filter(farmer=user) | OrderItem.objects.filter(order__buyer=user)