import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'farmket.settings')
django.setup()

import re
from accounts.models import User, FarmerProfile, BuyerProfile
from products.models import Product, Category, Review, ProductImage
from crops.models import CropGrowth
from posts.models import Post
from django.conf import settings
from django.db.models import Count, Min, Max

print("=" * 60)
print("FARMKET DATABASE SEEDING - AUTOMATED VALIDATION SUITE")
print("=" * 60)

farmers = User.objects.filter(user_type='farmer', email__endswith='@farmket.test')
buyers = User.objects.filter(user_type='buyer', email__endswith='@farmket.test')
farmer_profiles = FarmerProfile.objects.filter(user__in=farmers)
buyer_profiles = BuyerProfile.objects.filter(user__in=buyers)
products = Product.objects.filter(farmer__in=farmers)
categories = Category.objects.all()

# 1. Farmers
f_count = farmers.count()
print(f"1. Farmer user count        : {f_count:3d} (Expected: 50) -> {'PASS' if f_count == 50 else 'FAIL'}")

# 2. Buyers
b_count = buyers.count()
print(f"2. Buyer user count         : {b_count:3d} (Expected: 50) -> {'PASS' if b_count == 50 else 'FAIL'}")

# 3. Farmer profiles
fp_count = farmer_profiles.count()
print(f"3. Farmer profiles count    : {fp_count:3d} (Expected: 50) -> {'PASS' if fp_count == 50 else 'FAIL'}")

# 4. Buyer profiles
bp_count = buyer_profiles.count()
print(f"4. Buyer profiles count     : {bp_count:3d} (Expected: 50) -> {'PASS' if bp_count == 50 else 'FAIL'}")

# 5. Products
p_count = products.count()
print(f"5. Total products count     : {p_count:3d} (Expected: >= 250) -> {'PASS' if p_count >= 250 else 'FAIL'}")

# 6. Products per farmer
prods_stat = farmers.annotate(p_count=Count('products')).aggregate(min_p=Min('p_count'), max_p=Max('p_count'))
min_p = prods_stat['min_p']
max_p = prods_stat['max_p']
print(f"6. Products per farmer      : Min: {min_p}, Max: {max_p} (Min >= 5) -> {'PASS' if min_p >= 5 else 'FAIL'}")

# 7. Foreign key integrity
orphan_prods = Product.objects.filter(farmer__isnull=True).count()
no_cat_prods = Product.objects.filter(category__isnull=True).count()
print(f"7. FK Integrity (Orphans)   : {orphan_prods} orphan prods, {no_cat_prods} no-cat -> {'PASS' if orphan_prods == 0 and no_cat_prods == 0 else 'FAIL'}")

# 8. Prices and Stock validity
invalid_prices = Product.objects.filter(price__lte=0).count()
invalid_stocks = Product.objects.filter(stock_quantity__lt=0).count()
print(f"8. Pricing & Stock Checks   : {invalid_prices} invalid prices, {invalid_stocks} invalid stocks -> {'PASS' if invalid_prices == 0 and invalid_stocks == 0 else 'FAIL'}")

# 9. Email and Phone validation
emails = list(User.objects.values_list('email', flat=True))
unique_emails = len(emails) == len(set(emails))
phone_re = re.compile(r'^\+?1?\d{9,15}$')
invalid_phones = [u.phone_number for u in User.objects.filter(email__endswith='@farmket.test') if not phone_re.match(u.phone_number)]
print(f"9. Email & Phone Validity   : Unique: {unique_emails}, Invalid Phones: {len(invalid_phones)} -> {'PASS' if unique_emails and len(invalid_phones) == 0 else 'FAIL'}")

# 10. Existing superuser preserved
superuser = User.objects.filter(email='pranavkavade9@gmail.com').first()
print(f"10. Superuser Protected     : {superuser.email if superuser else 'None'} -> {'PASS' if superuser and superuser.is_superuser else 'FAIL'}")

# 11. Product Images
pi_count = ProductImage.objects.count()
prods_without_images = Product.objects.filter(farmer__in=farmers, images__isnull=True).count()
# Check file existence on disk
missing_files = 0
for pi in ProductImage.objects.all():
    file_path = os.path.join(settings.MEDIA_ROOT, pi.image.name)
    if not os.path.exists(file_path):
        missing_files += 1

print(f"11. Product Images Count    : {pi_count:3d} (Expected: 300) -> {'PASS' if pi_count >= 300 else 'FAIL'}")
print(f"12. Products Without Image  : {prods_without_images:3d} (Expected: 0) -> {'PASS' if prods_without_images == 0 else 'FAIL'}")
print(f"13. Image Files on Disk     : Missing: {missing_files} -> {'PASS' if missing_files == 0 else 'FAIL'}")

# 14. Optional related data
rev_count = Review.objects.count()
crop_count = CropGrowth.objects.count()
post_count = Post.objects.count()
print(f"14. Enriched Relationships  : Reviews: {rev_count}, CropGrowths: {crop_count}, Posts: {post_count}")

print("=" * 60)
print("ALL VALIDATION SUITE CHECKS COMPLETED")
print("=" * 60)

