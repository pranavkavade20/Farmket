from django.db import models

class AnalyticsSnapshot(models.Model):
    date = models.DateField(unique=True)
    
    # Executive
    total_farmers = models.IntegerField(default=0)
    total_buyers = models.IntegerField(default=0)
    active_users = models.IntegerField(default=0)
    total_products = models.IntegerField(default=0)
    total_orders = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Snapshot calculated at
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Snapshot for {self.date}"

class BusinessInsight(models.Model):
    INSIGHT_TYPES = (
        ('demand', 'Demand'),
        ('supply', 'Supply'),
        ('revenue', 'Revenue'),
        ('user', 'User Growth'),
        ('operations', 'Operations'),
    )
    insight_type = models.CharField(max_length=20, choices=INSIGHT_TYPES)
    message = models.TextField()
    is_actionable = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.insight_type.capitalize()} Insight - {self.created_at.date()}"
