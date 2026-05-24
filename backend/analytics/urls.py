from django.urls import path
from .views import FarmerAnalyticsView, BuyerAnalyticsView

app_name = 'analytics'

urlpatterns = [
    path('farmer/', FarmerAnalyticsView.as_view(), name='analytics-farmer'),
    path('buyer/', BuyerAnalyticsView.as_view(), name='analytics-buyer'),
]
