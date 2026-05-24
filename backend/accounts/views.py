from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import FarmerProfile, BuyerProfile
from .serializers import (
    UserSerializer, RegisterSerializer, UserUpdateSerializer,
    FarmerProfileSerializer, BuyerProfileSerializer,
)

User = get_user_model()


def get_tokens_for_user(user):
    """Generate JWT access + refresh tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(APIView):
    """
    POST /api/v1/accounts/register/
    Register a new user and return tokens + user data.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response(
                {
                    'user': UserSerializer(user, context={'request': request}).data,
                    'token': tokens['access'],
                    'refresh_token': tokens['refresh'],
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    """
    GET  /api/v1/accounts/me/  → return current user profile
    PATCH /api/v1/accounts/me/ → update current user profile
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    POST /api/v1/accounts/logout/
    Blacklist the provided refresh token.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'detail': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)


# ── Admin / extended viewsets ─────────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)


class FarmerProfileViewSet(viewsets.ModelViewSet):
    queryset = FarmerProfile.objects.all()
    serializer_class = FarmerProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class BuyerProfileViewSet(viewsets.ModelViewSet):
    queryset = BuyerProfile.objects.all()
    serializer_class = BuyerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return BuyerProfile.objects.all()
        return BuyerProfile.objects.filter(user=self.request.user)


class ChangePasswordView(APIView):
    """
    POST /api/v1/accounts/change-password/
    Change the currently authenticated user's password.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password', '')
        new_password = request.data.get('new_password', '')

        if not user.check_password(old_password):
            return Response(
                {'old_password': ['Current password is incorrect.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(new_password, user=user)
        except ValidationError as e:
            return Response({'new_password': list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Password changed successfully.'}, status=status.HTTP_200_OK)


class DashboardStatsView(APIView):
    """
    GET /api/v1/accounts/dashboard-stats/
    Returns summary statistics for the logged-in user's dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from orders.models import Order, OrderItem
        from products.models import Product

        user = request.user

        if user.user_type == 'farmer':
            # Farmer stats
            total_products = Product.objects.filter(farmer=user).count()
            farmer_order_items = OrderItem.objects.filter(farmer=user)
            total_orders = farmer_order_items.values('order').distinct().count()
            pending_orders = farmer_order_items.filter(status='pending').values('order').distinct().count()
            total_revenue = sum(
                item.subtotal for item in farmer_order_items.filter(status='delivered')
            )
            return Response({
                'total_orders': total_orders,
                'pending_orders': pending_orders,
                'total_products': total_products,
                'total_revenue': float(total_revenue),
            })
        else:
            # Buyer stats
            buyer_orders = Order.objects.filter(buyer=user)
            total_orders = buyer_orders.count()
            pending_orders = buyer_orders.filter(status__in=['pending', 'processing']).count()
            total_spent = sum(
                float(order.total_amount) for order in buyer_orders.filter(status='delivered')
            )
            return Response({
                'total_orders': total_orders,
                'pending_orders': pending_orders,
                'total_revenue': total_spent,
                'total_products': 0,
            })