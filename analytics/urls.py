from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    path('', views.dashboard_view, name='dashboard'),
    path('users/', views.users_analytics_view, name='users'),
    path('products/', views.products_analytics_view, name='products'),
    path('orders/', views.orders_analytics_view, name='orders'),
]
