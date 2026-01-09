from django.urls import path
from . import views

app_name = 'products'

urlpatterns = [
    path('', views.home_view, name='home'),
    path('contact/', views.contact, name='contact'),
    path('about/', views.about, name='about'),
    path('faq/', views.faq, name='faq'),
    path('list/', views.product_list_view, name='list'),
    path('add/', views.add_product_view, name='add'),
    path('my-products/', views.my_products_view, name='my_products'),
    path('<slug:slug>/', views.product_detail_view, name='detail'),
    path('<slug:slug>/edit/', views.edit_product_view, name='edit'),
    path('<slug:slug>/delete/', views.delete_product_view, name='delete'),
]