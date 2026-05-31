from django.contrib import admin
from .models import AnalyticsSnapshot, BusinessInsight

@admin.register(AnalyticsSnapshot)
class AnalyticsSnapshotAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_farmers', 'total_buyers', 'active_users', 'total_products', 'total_orders', 'total_revenue']
    list_filter = ['date']
    date_hierarchy = 'date'
    readonly_fields = ['date', 'total_farmers', 'total_buyers', 'active_users', 'total_products', 'total_orders', 'total_revenue']
    
    def has_add_permission(self, request):
        return False
        
    def has_delete_permission(self, request, obj=None):
        return False

@admin.register(BusinessInsight)
class BusinessInsightAdmin(admin.ModelAdmin):
    list_display = ['insight_type', 'message_snippet', 'is_actionable', 'created_at']
    list_filter = ['insight_type', 'is_actionable', 'created_at']
    search_fields = ['message']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at']

    def message_snippet(self, obj):
        return obj.message[:50] + "..." if len(obj.message) > 50 else obj.message
    message_snippet.short_description = 'Message'
