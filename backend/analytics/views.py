from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
import json
from django.http import HttpResponse
from .services import DashboardAnalyticsService


class FarmerAnalyticsView(APIView):
    """
    GET /api/v1/analytics/farmer/
    Returns comprehensive analytics for farmer accounts:
    - KPIs (total revenue, total orders, active products, avg rating)
    - Monthly revenue trend (last 6 months)
    - Top products by views
    - Products by category
    - Recent orders
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from products.models import Product
        from orders.models import Order, OrderItem

        user = request.user

        if user.user_type != 'farmer':
            return Response({'error': 'Analytics are only available for farmer accounts.'}, status=403)

        # ── KPIs ─────────────────────────────────────────────────────────────
        products = Product.objects.filter(farmer=user)
        total_products = products.count()
        active_products = products.filter(is_available=True).count()
        total_views = products.aggregate(total=Sum('views'))['total'] or 0

        farmer_items = OrderItem.objects.filter(farmer=user)
        delivered_items = farmer_items.filter(status='delivered')

        # Use price * quantity for actual revenue
        total_revenue = sum(float(item.subtotal) for item in delivered_items)

        total_orders = farmer_items.values('order').distinct().count()
        pending_orders = farmer_items.filter(status='pending').values('order').distinct().count()

        # Average rating across all products
        from products.models import Review
        reviews = Review.objects.filter(product__farmer=user)
        avg_rating = reviews.aggregate(avg=Avg('rating'))['avg'] or 0
        total_reviews = reviews.count()

        # ── Monthly revenue trend (last 6 months) ────────────────────────────
        six_months_ago = timezone.now() - timedelta(days=180)
        monthly_revenue_qs = (
            OrderItem.objects
            .filter(farmer=user, status='delivered', order__created_at__gte=six_months_ago)
            .annotate(month=TruncMonth('order__created_at'))
            .values('month')
            .annotate(revenue=Sum('price'))
            .order_by('month')
        )
        # Build a map for the last 6 calendar months
        revenue_by_month = {
            item['month'].strftime('%Y-%m'): float(item['revenue'] or 0)
            for item in monthly_revenue_qs
        }
        revenue_trend = []
        now = timezone.now()
        for i in range(5, -1, -1):
            month_date = (now - timedelta(days=30 * i)).replace(day=1)
            key = month_date.strftime('%Y-%m')
            label = month_date.strftime('%b')
            revenue_trend.append({'month': label, 'revenue': revenue_by_month.get(key, 0)})

        # ── Monthly orders trend ──────────────────────────────────────────────
        monthly_orders_qs = (
            OrderItem.objects
            .filter(farmer=user, order__created_at__gte=six_months_ago)
            .annotate(month=TruncMonth('order__created_at'))
            .values('month')
            .annotate(count=Count('order', distinct=True))
            .order_by('month')
        )
        orders_by_month = {
            item['month'].strftime('%Y-%m'): item['count']
            for item in monthly_orders_qs
        }
        orders_trend = []
        for i in range(5, -1, -1):
            month_date = (now - timedelta(days=30 * i)).replace(day=1)
            key = month_date.strftime('%Y-%m')
            label = month_date.strftime('%b')
            orders_trend.append({'month': label, 'orders': orders_by_month.get(key, 0)})

        # ── Top products by views ─────────────────────────────────────────────
        top_products = list(
            products.order_by('-views')[:5].values('name', 'views', 'price', 'stock_quantity', 'is_available')
        )

        # ── Products by category ──────────────────────────────────────────────
        category_dist = list(
            products.values('category__name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        category_data = [
            {'name': item['category__name'] or 'Uncategorized', 'value': item['count']}
            for item in category_dist
        ]

        # ── Recent 5 orders ───────────────────────────────────────────────────
        recent_order_ids = (
            farmer_items.values('order')
            .distinct()
            .order_by('-order__created_at')[:5]
        )
        recent_orders = []
        for item in recent_order_ids:
            from orders.models import Order as OrderModel
            try:
                order = OrderModel.objects.get(id=item['order'])
                recent_orders.append({
                    'id': order.id,
                    'order_number': order.order_number,
                    'status': order.status,
                    'total_amount': str(order.total_amount),
                    'created_at': order.created_at.isoformat(),
                })
            except OrderModel.DoesNotExist:
                pass

        return Response({
            'kpis': {
                'total_revenue': total_revenue,
                'total_orders': total_orders,
                'pending_orders': pending_orders,
                'total_products': total_products,
                'active_products': active_products,
                'total_views': total_views,
                'avg_rating': round(float(avg_rating), 1),
                'total_reviews': total_reviews,
            },
            'revenue_trend': revenue_trend,
            'orders_trend': orders_trend,
            'top_products': top_products,
            'category_distribution': category_data,
            'recent_orders': recent_orders,
        })


class BuyerAnalyticsView(APIView):
    """
    GET /api/v1/analytics/buyer/
    Returns purchase analytics for buyer accounts.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from orders.models import Order, OrderItem
        user = request.user

        if user.user_type not in ('buyer', 'admin'):
            return Response({'error': 'Not a buyer account.'}, status=403)

        orders = Order.objects.filter(buyer=user)
        total_orders = orders.count()
        total_spent = sum(float(o.total_amount) for o in orders.filter(status='delivered'))
        pending_orders = orders.filter(status__in=['pending', 'processing']).count()

        # Monthly spend trend
        six_months_ago = timezone.now() - timedelta(days=180)
        monthly_spend_qs = (
            orders.filter(status='delivered', created_at__gte=six_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(total=Sum('total_amount'))
            .order_by('month')
        )
        spend_by_month = {
            item['month'].strftime('%Y-%m'): float(item['total'] or 0)
            for item in monthly_spend_qs
        }
        now = timezone.now()
        spend_trend = []
        for i in range(5, -1, -1):
            month_date = (now - timedelta(days=30 * i)).replace(day=1)
            key = month_date.strftime('%Y-%m')
            label = month_date.strftime('%b')
            spend_trend.append({'month': label, 'spent': spend_by_month.get(key, 0)})

        return Response({
            'kpis': {
                'total_orders': total_orders,
                'pending_orders': pending_orders,
                'total_spent': total_spent,
            },
            'spend_trend': spend_trend,
        })

class IsAdminUserType(IsAuthenticated):
    def has_permission(self, request, view):
        is_authenticated = super().has_permission(request, view)
        return is_authenticated and request.user.user_type == 'admin'

class AdminExecutiveOverviewAPIView(APIView):
    permission_classes = [IsAdminUserType]

    def get(self, request):
        data = DashboardAnalyticsService.get_executive_overview()
        return Response(data)

class AdminUserAnalyticsAPIView(APIView):
    permission_classes = [IsAdminUserType]

    def get(self, request):
        data = DashboardAnalyticsService.get_user_analytics()
        return Response(data)

class AdminMarketplaceAnalyticsAPIView(APIView):
    permission_classes = [IsAdminUserType]

    def get(self, request):
        data = DashboardAnalyticsService.get_marketplace_analytics()
        return Response(data)

class AdminCropAnalyticsAPIView(APIView):
    permission_classes = [IsAdminUserType]

    def get(self, request):
        data = DashboardAnalyticsService.get_crop_analytics()
        return Response(data)

class AdminExportReportAPIView(APIView):
    permission_classes = [IsAdminUserType]

    def get(self, request):
        model_name = request.query_params.get('type', 'users')
        csv_data = DashboardAnalyticsService.export_csv_report(model_name)
        
        response = HttpResponse(csv_data, content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{model_name}_report.csv"'
        return response
