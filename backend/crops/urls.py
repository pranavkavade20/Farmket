from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CropGrowthViewSet, CropReservationViewSet

app_name = 'crops'

router = DefaultRouter()
router.register(r'reservations', CropReservationViewSet, basename='reservations')
router.register(r'', CropGrowthViewSet, basename='crops')

urlpatterns = [
    path('', include(router.urls)),
]
