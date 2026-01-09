
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, FarmerProfile, BuyerProfile

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'user_type', 'is_verified', 'is_staff', 'created_at']
    list_filter = ['user_type', 'is_verified', 'is_staff', 'is_superuser']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('user_type', 'phone_number', 'address', 'profile_picture', 'is_verified')}),
    )
    search_fields = ['username', 'email', 'phone_number']
    date_hierarchy = 'created_at'

@admin.register(FarmerProfile)
class FarmerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'farm_name', 'location', 'organic_certified', 'rating', 'total_sales']
    list_filter = ['organic_certified']
    search_fields = ['farm_name', 'location', 'user__username']

@admin.register(BuyerProfile)
class BuyerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'company_name', 'delivery_address']
    search_fields = ['company_name', 'user__username']
