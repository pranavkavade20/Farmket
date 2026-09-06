import logging
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db import transaction
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import FarmerProfile, BuyerProfile
from .serializers import (
    UserSerializer, RegisterSerializer, UserUpdateSerializer,
    FarmerProfileSerializer, BuyerProfileSerializer,
    CustomTokenObtainPairSerializer, ChangePasswordSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    VerifyEmailSerializer, ResendVerificationSerializer,
    ChangeEmailSerializer, VerifyEmailChangeSerializer,
)
from .tokens import (
    generate_security_token,
    validate_security_token,
    consume_security_token,
)
from .services import (
    email_service,
    record_password_history,
    check_password_reuse,
    invalidate_user_sessions,
    get_tokens_for_user,
)
from .throttling import (
    AuthRateThrottle,
    PasswordResetRateThrottle,
    EmailVerificationRateThrottle,
    UserSecurityActionThrottle,
)

logger = logging.getLogger(__name__)
User = get_user_model()


def _get_client_ip(request) -> str | None:
    """Extract client IP address considering proxy headers."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


# ── Core Authentication Views ──────────────────────────────────────────────────

class LoginView(TokenObtainPairView):
    """
    POST /api/accounts/login/
    Authenticates user and returns JWT access + refresh tokens and user profile.
    """
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [AuthRateThrottle]

    @extend_schema(
        tags=['Authentication'],
        summary="User Login",
        description="Authenticate with email and password. Returns access and refresh JWT tokens and user profile.",
        responses={200: CustomTokenObtainPairSerializer, 401: OpenApiResponse(description="Invalid credentials")},
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class RegisterView(APIView):
    """
    POST /api/accounts/register/
    Registers a new user, sends email verification token, and returns auth tokens.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    @extend_schema(
        tags=['Authentication'],
        summary="User Registration",
        description="Register a new buyer or farmer account. Sends verification email asynchronously.",
        request=RegisterSerializer,
        responses={201: OpenApiResponse(description="Registration successful"), 400: OpenApiResponse(description="Validation error")},
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)

            # Generate and send email verification token
            try:
                raw_token = generate_security_token(
                    user=user,
                    token_type='email_verification',
                    ip_address=_get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                )
                email_service.send_verification_email(user, raw_token)
            except Exception as e:
                logger.error(f"Failed to dispatch verification email on registration for {user.email}: {e}")

            user_data = UserSerializer(user, context={'request': request}).data
            return Response(
                {
                    'user': user_data,
                    'access': tokens['access'],
                    'refresh': tokens['refresh'],
                    # Compatibility aliases
                    'token': tokens['access'],
                    'refresh_token': tokens['refresh'],
                    'message': 'Registration successful. A verification link has been sent to your email.',
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    POST /api/accounts/logout/
    Blacklists the caller's current refresh token.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Authentication'],
        summary="Logout Current Session",
        description="Blacklist the caller's refresh token.",
        responses={200: OpenApiResponse(description="Logged out"), 400: OpenApiResponse(description="Invalid token")},
    )
    def post(self, request):
        refresh_token = request.data.get('refresh_token') or request.data.get('refresh')
        if not refresh_token:
            return Response({'detail': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'detail': 'Invalid or already expired token.'}, status=status.HTTP_400_BAD_REQUEST)


class LogoutAllView(APIView):
    """
    POST /api/accounts/logout-all/
    Invalidates all active sessions across all devices for the current user.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Authentication'],
        summary="Logout All Devices",
        description="Revoke all active sessions and access tokens across all devices for the user.",
        responses={200: OpenApiResponse(description="Logged out of all devices")},
    )
    def post(self, request):
        blacklisted_count = invalidate_user_sessions(request.user)
        logger.info(f"User {request.user.email} logged out of all devices ({blacklisted_count} tokens blacklisted).")
        return Response(
            {'detail': 'Successfully logged out from all devices. All previous tokens have been revoked.'},
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    """
    GET  /api/accounts/me/  -> return current user profile
    PATCH /api/accounts/me/ -> update profile information
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(tags=['Authentication'], summary="Get Current User Profile")
    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    @extend_schema(tags=['Authentication'], summary="Update User Profile", request=UserUpdateSerializer)
    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Password Management Views ──────────────────────────────────────────────────

class ChangePasswordView(APIView):
    """
    POST /api/accounts/change-password/
    Change password for authenticated user with password history enforcement.
    """
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [UserSecurityActionThrottle]

    @extend_schema(
        tags=['Authentication'],
        summary="Change Password",
        description="Change password for authenticated user. Enforces password complexity, checks history to prevent reuse, and invalidates other active sessions.",
        request=ChangePasswordSerializer,
        responses={200: OpenApiResponse(description="Password changed"), 400: OpenApiResponse(description="Validation error")},
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_password = serializer.validated_data['new_password']
        user = request.user

        with transaction.atomic():
            user.set_password(new_password)
            user.save()
            record_password_history(user, new_password)
            # Invalidate all prior sessions/tokens across other devices
            invalidate_user_sessions(user)
            # Generate clean new tokens for the current session
            tokens = get_tokens_for_user(user)

        return Response(
            {
                'detail': 'Password changed successfully. Other device sessions have been signed out.',
                'access': tokens['access'],
                'refresh': tokens['refresh'],
                'token': tokens['access'],
                'refresh_token': tokens['refresh'],
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetRequestView(APIView):
    """
    POST /api/accounts/password-reset/
    Request password reset email. Anti-enumeration safe: always returns 200.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetRateThrottle]

    @extend_schema(
        tags=['Authentication'],
        summary="Request Password Reset",
        description="Send password reset link to user email if account exists. Anti-enumeration safe.",
        request=PasswordResetRequestSerializer,
        responses={200: OpenApiResponse(description="Request processed")},
    )
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        user = User.objects.filter(email__iexact=email, is_active=True).first()

        if user:
            try:
                raw_token = generate_security_token(
                    user=user,
                    token_type='password_reset',
                    ip_address=_get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                )
                email_service.send_password_reset_email(user, raw_token)
            except Exception as exc:
                logger.error(f"Failed to generate/send password reset email for {email}: {exc}")

        # Uniform response prevents email/account enumeration
        return Response(
            {'detail': 'If an account exists with this email, a password reset link has been sent.'},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """
    POST /api/accounts/password-reset-confirm/
    Confirms password reset using single-use security token and sets new password.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    @extend_schema(
        tags=['Authentication'],
        summary="Confirm Password Reset",
        description="Reset password using single-use cryptographically hashed token. Revokes all existing sessions upon completion.",
        request=PasswordResetConfirmSerializer,
        responses={200: OpenApiResponse(description="Password reset successful"), 400: OpenApiResponse(description="Invalid or expired token")},
    )
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        raw_token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        security_token = validate_security_token(raw_token, 'password_reset')
        if not security_token:
            return Response(
                {'detail': 'Invalid or expired password reset link. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = security_token.user

        # Prevent password reuse
        if check_password_reuse(user, new_password):
            return Response(
                {'new_password': ['You cannot reuse your current password or any of your last 5 passwords.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            if not consume_security_token(security_token):
                return Response(
                    {'detail': 'Reset link has already been used or expired.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.set_password(new_password)
            user.save()
            record_password_history(user, new_password)
            # Invalidate all prior tokens/sessions
            invalidate_user_sessions(user)

        logger.info(f"Password reset completed for user {user.email}.")
        return Response(
            {'detail': 'Password reset successful. You can now log in with your new password.'},
            status=status.HTTP_200_OK,
        )


# ── Email Verification & Email Change Views ────────────────────────────────────

class VerifyEmailView(APIView):
    """
    POST /api/accounts/verify-email/
    Verifies user email using single-use security token.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    @extend_schema(
        tags=['Authentication'],
        summary="Verify Email Address",
        description="Verifies user's email address using single-use token.",
        request=VerifyEmailSerializer,
        responses={200: OpenApiResponse(description="Email verified"), 400: OpenApiResponse(description="Invalid token")},
    )
    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        raw_token = serializer.validated_data['token']
        security_token = validate_security_token(raw_token, 'email_verification')

        if not security_token:
            return Response(
                {'detail': 'Invalid or expired verification link. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = security_token.user
        with transaction.atomic():
            if not consume_security_token(security_token):
                return Response(
                    {'detail': 'Verification link has already been used or expired.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.is_verified = True
            user.save(update_fields=['is_verified'])

        logger.info(f"Email verified for user {user.email}.")
        return Response(
            {'detail': 'Your email address has been verified successfully!'},
            status=status.HTTP_200_OK,
        )


class ResendVerificationView(APIView):
    """
    POST /api/accounts/resend-verification/
    Resends email verification link. Anti-enumeration safe.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [EmailVerificationRateThrottle]

    @extend_schema(
        tags=['Authentication'],
        summary="Resend Email Verification",
        description="Resend account email verification link. Anti-enumeration safe.",
        request=ResendVerificationSerializer,
        responses={200: OpenApiResponse(description="Request processed")},
    )
    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        user = User.objects.filter(email__iexact=email, is_active=True).first()

        if user and not user.is_verified:
            try:
                raw_token = generate_security_token(
                    user=user,
                    token_type='email_verification',
                    ip_address=_get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                )
                email_service.send_verification_email(user, raw_token)
            except Exception as exc:
                logger.error(f"Failed to resend verification email for {email}: {exc}")

        return Response(
            {'detail': 'If an unverified account exists with this email, a verification link has been sent.'},
            status=status.HTTP_200_OK,
        )


class ChangeEmailView(APIView):
    """
    POST /api/accounts/change-email/
    Request changing email address. Requires current password verification and confirmation link.
    """
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [UserSecurityActionThrottle]

    @extend_schema(
        tags=['Authentication'],
        summary="Request Email Change",
        description="Initiate change of email address. Requires current password. Sends confirmation token to new address.",
        request=ChangeEmailSerializer,
        responses={200: OpenApiResponse(description="Confirmation sent"), 400: OpenApiResponse(description="Validation error")},
    )
    def post(self, request):
        serializer = ChangeEmailSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_email = serializer.validated_data['new_email']
        user = request.user

        try:
            raw_token = generate_security_token(
                user=user,
                token_type='email_change',
                new_email=new_email,
                ip_address=_get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
            )
            email_service.send_email_change_verification(user, new_email, raw_token)
        except Exception as exc:
            logger.error(f"Failed to dispatch email change token for user {user.id}: {exc}")
            return Response(
                {'detail': 'Failed to send confirmation email. Please try again later.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {'detail': f'A confirmation link has been sent to {new_email}. Please click it to complete the update.'},
            status=status.HTTP_200_OK,
        )


class VerifyEmailChangeView(APIView):
    """
    POST /api/accounts/verify-email-change/
    Confirms email address update using token sent to the new email.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    @extend_schema(
        tags=['Authentication'],
        summary="Confirm Email Change",
        description="Confirm email change using token received at the new email address.",
        request=VerifyEmailChangeSerializer,
        responses={200: OpenApiResponse(description="Email changed successfully"), 400: OpenApiResponse(description="Invalid token")},
    )
    def post(self, request):
        serializer = VerifyEmailChangeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        raw_token = serializer.validated_data['token']
        security_token = validate_security_token(raw_token, 'email_change')

        if not security_token or not security_token.new_email:
            return Response(
                {'detail': 'Invalid or expired confirmation link.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_email = security_token.new_email
        if User.objects.filter(email__iexact=new_email).exclude(id=security_token.user.id).exists():
            return Response(
                {'detail': 'This email address is already in use by another account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = security_token.user
        with transaction.atomic():
            if not consume_security_token(security_token):
                return Response(
                    {'detail': 'Confirmation link has already been used or expired.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.email = new_email
            user.is_verified = True
            user.save(update_fields=['email', 'is_verified'])
            # Invalidate all prior sessions on email change for security
            invalidate_user_sessions(user)

        logger.info(f"Email change completed for user ID {user.id}. New email: {new_email}")
        return Response(
            {'detail': 'Your email address has been successfully updated. Please log in with your new email.'},
            status=status.HTTP_200_OK,
        )


# ── ViewSets and Profile Utilities ─────────────────────────────────────────────

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


class DashboardStatsView(APIView):
    """
    GET /api/accounts/dashboard-stats/
    Returns summary statistics for the logged-in user's dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from orders.models import Order, OrderItem
        from products.models import Product
        from django.db.models import Sum, F

        user = request.user

        if user.user_type == 'farmer':
            total_products = Product.objects.filter(farmer=user).count()
            farmer_order_items = OrderItem.objects.filter(farmer=user)
            total_orders = farmer_order_items.values('order').distinct().count()
            pending_orders = farmer_order_items.filter(status='pending').values('order').distinct().count()
            total_revenue = farmer_order_items.filter(status='delivered').aggregate(
                total=Sum(F('quantity') * F('price'))
            )['total'] or 0.0
            return Response({
                'total_orders': total_orders,
                'pending_orders': pending_orders,
                'total_products': total_products,
                'total_revenue': float(total_revenue),
            })
        else:
            buyer_orders = Order.objects.filter(buyer=user)
            total_orders = buyer_orders.count()
            pending_orders = buyer_orders.filter(status__in=['pending', 'processing']).count()
            total_spent = buyer_orders.filter(status='delivered').aggregate(
                total=Sum('total_amount')
            )['total'] or 0.0
            return Response({
                'total_orders': total_orders,
                'pending_orders': pending_orders,
                'total_revenue': total_spent,
                'total_products': 0,
            })