from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView, RegisterView, LogoutView, LogoutAllView, MeView,
    ChangePasswordView, PasswordResetRequestView, PasswordResetConfirmView,
    VerifyEmailView, ResendVerificationView,
    ChangeEmailView, VerifyEmailChangeView,
    DashboardStatsView,
    UserViewSet, FarmerProfileViewSet, BuyerProfileViewSet,
)

app_name = 'accounts'

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'farmers', FarmerProfileViewSet)
router.register(r'buyers', BuyerProfileViewSet)

urlpatterns = [
    # Core Auth Endpoints
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='auth-token-refresh'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth-token-refresh-alias'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('logout-all/', LogoutAllView.as_view(), name='auth-logout-all'),
    path('me/', MeView.as_view(), name='auth-me'),

    # Password Management
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),

    # Email Verification & Change
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
    path('change-email/', ChangeEmailView.as_view(), name='change-email'),
    path('verify-email-change/', VerifyEmailChangeView.as_view(), name='verify-email-change'),

    # Dashboard & Profile Utilities
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),

    # Resource endpoints (users, farmers, buyers)
    path('', include(router.urls)),
]