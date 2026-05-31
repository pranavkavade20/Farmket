import csv
import io
from datetime import timedelta, date
from django.utils import timezone
from django.db.models import Count, Sum, Avg, Q, F
from django.db.models.functions import TruncMonth, TruncDay
from accounts.models import User
from products.models import Product, Category
from orders.models import Order, OrderItem
from analytics.models import AnalyticsSnapshot, BusinessInsight


class DashboardAnalyticsService:
    @staticmethod
    def get_executive_overview():
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        
        # Calculate current metrics
        total_farmers = User.objects.filter(user_type='farmer').count()
        total_buyers = User.objects.filter(user_type='buyer').count()
        total_products = Product.objects.count()
        total_orders = Order.objects.count()
        
        revenue_dict = Order.objects.filter(status='delivered').aggregate(total=Sum('total_amount'))
        total_revenue = float(revenue_dict['total'] or 0)
        
        # New in last 30 days
        new_farmers = User.objects.filter(user_type='farmer', created_at__gte=thirty_days_ago).count()
        new_buyers = User.objects.filter(user_type='buyer', created_at__gte=thirty_days_ago).count()
        new_products = Product.objects.filter(created_at__gte=thirty_days_ago).count()
        
        active_users = User.objects.filter(last_login__gte=now - timedelta(days=7)).count()
        
        # Trends data for the chart (last 30 days snapshot data)
        snapshots = AnalyticsSnapshot.objects.order_by('-date')[:30]
        revenue_trend = []
        user_trend = []
        
        for snap in reversed(snapshots):
            revenue_trend.append({
                'date': snap.date.strftime('%b %d'),
                'revenue': float(snap.total_revenue)
            })
            user_trend.append({
                'date': snap.date.strftime('%b %d'),
                'farmers': snap.total_farmers,
                'buyers': snap.total_buyers
            })
            
        # In case we don't have snapshot data yet, generate dummy/empty or calculate current
        if not snapshots:
            revenue_trend = [{'date': now.strftime('%b %d'), 'revenue': total_revenue}]
            user_trend = [{'date': now.strftime('%b %d'), 'farmers': total_farmers, 'buyers': total_buyers}]
            
        return {
            'kpis': {
                'total_farmers': total_farmers,
                'total_buyers': total_buyers,
                'total_products': total_products,
                'total_orders': total_orders,
                'total_revenue': total_revenue,
                'new_farmers_month': new_farmers,
                'new_buyers_month': new_buyers,
                'new_products_month': new_products,
                'active_users': active_users,
            },
            'revenue_trend': revenue_trend,
            'user_trend': user_trend
        }

    @staticmethod
    def get_user_analytics():
        now = timezone.now()
        six_months_ago = now - timedelta(days=180)
        
        user_growth_qs = User.objects.filter(created_at__gte=six_months_ago).annotate(
            month=TruncMonth('created_at')
        ).values('month', 'user_type').annotate(count=Count('id')).order_by('month')
        
        growth_data = {}
        for item in user_growth_qs:
            month_str = item['month'].strftime('%b %Y')
            if month_str not in growth_data:
                growth_data[month_str] = {'month': month_str, 'farmer': 0, 'buyer': 0}
            growth_data[month_str][item['user_type']] = item['count']
            
        return {
            'user_growth': list(growth_data.values())
        }

    @staticmethod
    def get_marketplace_analytics():
        # Order status distribution
        order_status = list(Order.objects.values('status').annotate(count=Count('id')))
        
        # Top categories
        categories = list(Product.objects.values('category__name').annotate(count=Count('id')).order_by('-count')[:5])
        
        return {
            'order_status': order_status,
            'top_categories': [{'name': c['category__name'] or 'Unknown', 'value': c['count']} for c in categories]
        }

    @staticmethod
    def get_crop_analytics():
        # Top crops listed
        top_crops = list(Product.objects.values('name').annotate(count=Count('id')).order_by('-count')[:10])
        
        # Harvest Intelligence (TODO: Update with new CropGrowth model)
        # upcoming_harvests = CropTracking.objects.filter(
        #     current_stage='growing', 
        #     expected_harvest_date__gte=timezone.now().date()
        # ).order_by('expected_harvest_date')[:10]
        
        # harvests_list = []
        # for h in upcoming_harvests:
        #     harvests_list.append({
        #         'product': h.product.name,
        #         'farmer': h.product.farmer.username,
        #         'expected_date': h.expected_harvest_date.strftime('%Y-%m-%d')
        #     })
            
        return {
            'top_crops': [{'name': c['name'], 'count': c['count']} for c in top_crops],
            'upcoming_harvests': [] # harvests_list
        }

    @staticmethod
    def export_csv_report(model_name):
        output = io.StringIO()
        writer = csv.writer(output)
        
        if model_name == 'users':
            writer.writerow(['ID', 'Username', 'Email', 'Type', 'Joined'])
            for user in User.objects.all().values_list('id', 'username', 'email', 'user_type', 'created_at'):
                writer.writerow(user)
        elif model_name == 'orders':
            writer.writerow(['ID', 'Order Number', 'Total Amount', 'Status', 'Date'])
            for order in Order.objects.all().values_list('id', 'order_number', 'total_amount', 'status', 'created_at'):
                writer.writerow(order)
                
        return output.getvalue()
