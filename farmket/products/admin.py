from django.contrib import admin
from .models import Category, Product, ProductImage, Review

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']
    list_filter = ['is_active']

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'farmer', 'category', 'price', 'stock_quantity', 'is_available', 'created_at']
    list_filter = ['is_available', 'is_organic', 'category', 'created_at']
    search_fields = ['name', 'description', 'farmer__username']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]
    date_hierarchy = 'created_at'
    list_per_page = 50

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'buyer', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['product__name', 'buyer__username', 'comment']
    date_hierarchy = 'created_at'