from django.contrib import admin
from .models import CropGrowth, CropStageHistory, CropReservation, CropFollower, Waitlist

class CropStageHistoryInline(admin.TabularInline):
    model = CropStageHistory
    extra = 0
    readonly_fields = ['previous_stage', 'current_stage', 'updated_by', 'remarks', 'timestamp']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False

@admin.register(CropGrowth)
class CropGrowthAdmin(admin.ModelAdmin):
    list_display = ['farmer', 'product', 'crop_stage', 'expected_harvest_date', 'expected_quantity', 'available_quantity', 'organic']
    list_filter = ['crop_stage', 'organic', 'expected_harvest_date']
    search_fields = ['farmer__username', 'product__name']
    autocomplete_fields = ['farmer', 'product']
    date_hierarchy = 'expected_harvest_date'
    inlines = [CropStageHistoryInline]

@admin.register(CropStageHistory)
class CropStageHistoryAdmin(admin.ModelAdmin):
    list_display = ['crop_growth', 'previous_stage', 'current_stage', 'updated_by', 'timestamp']
    list_filter = ['current_stage', 'timestamp']
    search_fields = ['crop_growth__farmer__username', 'crop_growth__product__name']
    autocomplete_fields = ['crop_growth', 'updated_by']
    date_hierarchy = 'timestamp'
    readonly_fields = ['timestamp']

@admin.register(CropReservation)
class CropReservationAdmin(admin.ModelAdmin):
    list_display = ['buyer', 'crop_growth', 'quantity_reserved', 'reservation_status', 'reserved_at']
    list_filter = ['reservation_status', 'reserved_at']
    search_fields = ['buyer__username', 'crop_growth__product__name']
    autocomplete_fields = ['buyer', 'crop_growth', 'order']
    date_hierarchy = 'reserved_at'

@admin.register(CropFollower)
class CropFollowerAdmin(admin.ModelAdmin):
    list_display = ['buyer', 'crop_growth', 'followed_at']
    search_fields = ['buyer__username', 'crop_growth__product__name']
    autocomplete_fields = ['buyer', 'crop_growth']
    date_hierarchy = 'followed_at'

@admin.register(Waitlist)
class WaitlistAdmin(admin.ModelAdmin):
    list_display = ['buyer', 'crop_growth', 'quantity', 'notified', 'created_at']
    list_filter = ['notified', 'created_at']
    search_fields = ['buyer__username', 'crop_growth__product__name']
    autocomplete_fields = ['buyer', 'crop_growth']
    date_hierarchy = 'created_at'
