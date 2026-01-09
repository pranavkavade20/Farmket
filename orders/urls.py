from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    path('cart/', views.cart_view, name='cart'),
    path('add-to-cart/<int:product_id>/', views.add_to_cart_view, name='add_to_cart'),
    path('update-cart/<int:item_id>/', views.update_cart_view, name='update_cart'),
    path('remove-from-cart/<int:item_id>/', views.remove_from_cart_view, name='remove_from_cart'),
    path('checkout/', views.checkout_view, name='checkout'),
    path('orders/', views.orders_view, name='orders'),
    path('orders/<int:order_id>/', views.order_detail_view, name='order_detail'),
    path('update-item/<int:item_id>/', views.update_item_status, name='update_item_status'),
]