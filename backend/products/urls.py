from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import CategoryViewSet, ProductViewSet, ProductImageViewSet, ReviewViewSet

app_name = 'products'

router = SimpleRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('products/<slug:product_slug>/images/', ProductImageViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('products/<slug:product_slug>/images/<int:pk>/', ProductImageViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'})),
    path('products/<slug:product_slug>/reviews/', ReviewViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('products/<slug:product_slug>/reviews/<int:pk>/', ReviewViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),
]