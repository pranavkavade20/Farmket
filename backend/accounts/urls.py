from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, MeView, LogoutView,
    UserViewSet, FarmerProfileViewSet, BuyerProfileViewSet,
    ChangePasswordView, DashboardStatsView,
)

app_name = 'accounts'

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'farmers', FarmerProfileViewSet)
router.register(r'buyers', BuyerProfileViewSet)

urlpatterns = [
    # Auth endpoints
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', TokenObtainPairView.as_view(), name='auth-login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='auth-token-refresh'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('me/', MeView.as_view(), name='auth-me'),

    # Profile utilities
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),

    # Resource endpoints
    path('', include(router.urls)),
]