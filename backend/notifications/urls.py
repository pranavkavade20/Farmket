from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import NotificationViewSet

app_name = 'notifications'

router = SimpleRouter()
router.register(r'', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
