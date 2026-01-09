from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta
from accounts.models import User, FarmerProfile
from products.models import Product, Category
from orders.models import Order, OrderItem
from chat.models import Message

@staff_member_required
def dashboard_view(request):
    # User Statistics
    total_users = User.objects.count()
    total_farmers = User.objects.filter(user_type='farmer').count()
    total_buyers = User.objects.filter(user_type='buyer').count()
    new_users_today = User.objects.filter(created_at__date=timezone.now().date()).count()
    
    # Product Statistics
    total_products = Product.objects.count()
    available_products = Product.objects.filter(is_available=True).count()
    organic_products = Product.objects.filter(is_organic=True).count()
    out_of_stock = Product.objects.filter(stock_quantity=0).count()
    
    # Order Statistics
    total_orders = Order.objects.count()
    pending_orders = Order.objects.filter(status='pending').count()
    delivered_orders = Order.objects.filter(status='delivered').count()
    total_revenue = Order.objects.filter(
        status__in=['confirmed', 'processing', 'shipped', 'delivered']
    ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    
    # Recent Activity
    recent_orders = Order.objects.all()[:10]
    recent_users = User.objects.all()[:10]
    top_products = Product.objects.annotate(
        order_count=Count('orderitem')
    ).order_by('-order_count')[:5]
    
    # Category Distribution
    category_stats = Category.objects.annotate(
        product_count=Count('products')
    ).order_by('-product_count')
    
    # Monthly Revenue (Last 6 months)
    monthly_revenue = []
    for i in range(6):
        month_start = timezone.now() - timedelta(days=30 * i)
        month_end = month_start + timedelta(days=30)
        revenue = Order.objects.filter(
            created_at__range=[month_start, month_end],
            status__in=['confirmed', 'processing', 'shipped', 'delivered']
        ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        monthly_revenue.append({
            'month': month_start.strftime('%B'),
            'revenue': float(revenue)
        })
    
    # Top Farmers
    top_farmers = User.objects.filter(user_type='farmer').annotate(
        total_sales=Count('products__orderitem')
    ).order_by('-total_sales')[:5]
    
    # Messages Statistics
    total_messages = Message.objects.count()
    messages_today = Message.objects.filter(created_at__date=timezone.now().date()).count()
    
    context = {
        'total_users': total_users,
        'total_farmers': total_farmers,
        'total_buyers': total_buyers,
        'new_users_today': new_users_today,
        'total_products': total_products,
        'available_products': available_products,
        'organic_products': organic_products,
        'out_of_stock': out_of_stock,
        'total_orders': total_orders,
        'pending_orders': pending_orders,
        'delivered_orders': delivered_orders,
        'total_revenue': total_revenue,
        'recent_orders': recent_orders,
        'recent_users': recent_users,
        'top_products': top_products,
        'category_stats': category_stats,
        'monthly_revenue': monthly_revenue,
        'top_farmers': top_farmers,
        'total_messages': total_messages,
        'messages_today': messages_today,
    }
    
    return render(request, 'analytics/dashboard.html', context)

@staff_member_required
def users_analytics_view(request):
    users = User.objects.all()
    
    # User growth over time
    user_growth = []
    for i in range(12):
        month_start = timezone.now() - timedelta(days=30 * i)
        month_end = month_start + timedelta(days=30)
        count = User.objects.filter(created_at__range=[month_start, month_end]).count()
        user_growth.append({
            'month': month_start.strftime('%B'),
            'count': count
        })
    
    context = {
        'users': users,
        'user_growth': user_growth,
    }
    return render(request, 'analytics/users.html', context)

@staff_member_required
def products_analytics_view(request):
    products = Product.objects.all()
    
    # Product performance
    product_performance = Product.objects.annotate(
        sales_count=Count('orderitem'),
        total_revenue=Sum('orderitem__price')
    ).order_by('-sales_count')[:20]
    
    context = {
        'products': products,
        'product_performance': product_performance,
    }
    return render(request, 'analytics/products.html', context)

@staff_member_required
def orders_analytics_view(request):
    orders = Order.objects.all()
    
    # Order status distribution
    status_distribution = Order.objects.values('status').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Daily orders (Last 30 days)
    daily_orders = []
    for i in range(30):
        day = timezone.now() - timedelta(days=i)
        count = Order.objects.filter(created_at__date=day.date()).count()
        daily_orders.append({
            'date': day.strftime('%Y-%m-%d'),
            'count': count
        })
    
    context = {
        'orders': orders,
        'status_distribution': status_distribution,
        'daily_orders': daily_orders,
    }
    return render(request, 'analytics/orders.html', context)

