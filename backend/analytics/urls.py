from django.urls import path
from .views import (
    FarmerAnalyticsView, 
    BuyerAnalyticsView,
    AdminExecutiveOverviewAPIView,
    AdminUserAnalyticsAPIView,
    AdminMarketplaceAnalyticsAPIView,
    AdminCropAnalyticsAPIView,
    AdminExportReportAPIView
)

app_name = 'analytics'

urlpatterns = [
    path('farmer/', FarmerAnalyticsView.as_view(), name='analytics-farmer'),
    path('buyer/', BuyerAnalyticsView.as_view(), name='analytics-buyer'),
    
    # Admin API Routes
    path('admin/executive/', AdminExecutiveOverviewAPIView.as_view(), name='admin-executive'),
    path('admin/users/', AdminUserAnalyticsAPIView.as_view(), name='admin-users'),
    path('admin/marketplace/', AdminMarketplaceAnalyticsAPIView.as_view(), name='admin-marketplace'),
    path('admin/crops/', AdminCropAnalyticsAPIView.as_view(), name='admin-crops'),
    path('admin/export/', AdminExportReportAPIView.as_view(), name='admin-export'),
]
