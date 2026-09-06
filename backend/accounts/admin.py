from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, FarmerProfile, BuyerProfile, SecurityToken, PasswordHistory

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'gender', 'user_type', 'is_verified', 'token_version', 'is_staff', 'created_at']
    list_filter = ['user_type', 'gender', 'is_verified', 'is_staff', 'is_superuser']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('user_type', 'gender', 'phone_number', 'address', 'profile_picture', 'is_verified', 'token_version')}),
    )
    search_fields = ['username', 'email', 'phone_number', 'first_name', 'last_name']
    date_hierarchy = 'created_at'

@admin.register(FarmerProfile)
class FarmerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'farm_name', 'location', 'organic_certified', 'rating', 'total_sales']
    list_filter = ['organic_certified']
    search_fields = ['farm_name', 'location', 'user__username', 'user__email']
    readonly_fields = ['rating', 'total_sales']
    autocomplete_fields = ['user']

@admin.register(BuyerProfile)
class BuyerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'company_name', 'delivery_address']
    search_fields = ['company_name', 'user__username', 'user__email']
    autocomplete_fields = ['user']

@admin.register(SecurityToken)
class SecurityTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'token_type', 'created_at', 'expires_at', 'used_at', 'is_expired']
    list_filter = ['token_type', 'used_at']
    search_fields = ['user__email', 'token_hash']
    readonly_fields = ['token_hash', 'created_at', 'expires_at', 'used_at', 'ip_address', 'user_agent']

@admin.register(PasswordHistory)
class PasswordHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']
    search_fields = ['user__email']
    readonly_fields = ['password_hash', 'created_at']
