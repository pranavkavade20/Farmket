from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from products.models import Product
from orders.models import Order
from django.db.models import Sum
from .models import AnalyticsSnapshot

@shared_task
def generate_daily_snapshot():
    now = timezone.now()
    yesterday = (now - timedelta(days=1)).date()
    
    # Check if snapshot already exists
    if AnalyticsSnapshot.objects.filter(date=yesterday).exists():
        return f"Snapshot for {yesterday} already exists."
        
    total_farmers = User.objects.filter(user_type='farmer', created_at__lte=now).count()
    total_buyers = User.objects.filter(user_type='buyer', created_at__lte=now).count()
    active_users = User.objects.filter(last_login__gte=now - timedelta(days=7)).count()
    
    total_products = Product.objects.filter(created_at__lte=now).count()
    total_orders = Order.objects.filter(created_at__lte=now).count()
    
    revenue_dict = Order.objects.filter(status='delivered', created_at__lte=now).aggregate(total=Sum('total_amount'))
    total_revenue = float(revenue_dict['total'] or 0)
    
    snapshot = AnalyticsSnapshot.objects.create(
        date=yesterday,
        total_farmers=total_farmers,
        total_buyers=total_buyers,
        active_users=active_users,
        total_products=total_products,
        total_orders=total_orders,
        total_revenue=total_revenue
    )
    
    return f"Created snapshot for {yesterday} with revenue {total_revenue}"
