"""
Django Management Command: seed_farmket_data

Populates the Farmket database with production-quality, realistic Indian test data:
- 50 Farmers with authentic identities, agricultural regions, farm profiles, and coordinates
- 50 Buyers spanning individual households, restaurants, cafes, grocery marts, and vendors
- 250+ Agricultural products with realistic INR pricing, units, descriptions, and farmer associations
- Ensures every farmer owns at least 5 products (default 6-8 per farmer)
- Optional enrichment: reviews, crop lifecycle tracking (pre-booking), and social posts
- Idempotent and safe: does not duplicate records on rerun
- Supports --dry-run, --reset-seed-data, --farmers, --buyers, --products-per-farmer

Usage:
    python manage.py seed_farmket_data
    python manage.py seed_farmket_data --farmers 50 --buyers 50 --products-per-farmer 6
    python manage.py seed_farmket_data --dry-run
    python manage.py seed_farmket_data --reset-seed-data
"""

import os
import random
from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.text import slugify
from django.conf import settings

from accounts.models import User, FarmerProfile, BuyerProfile
from accounts.services import record_password_history
from products.models import Category, Product, ProductImage, Review
from crops.models import CropGrowth, CropStage
from posts.models import Post

from ._image_generator import generate_all_catalog_images
from ._seed_data import (
    REGIONS,
    FARMERS_DATA,
    BUYERS_DATA,
    CATEGORIES_DATA,
    PRODUCTS_CATALOG,
    REVIEW_COMMENTS,
)


class Command(BaseCommand):
    help = "Seed database with realistic Indian farmers, buyers, categories, and products."

    SEED_DOMAIN = "farmket.test"
    DEFAULT_PASSWORD = os.getenv("FARMKET_SEED_PASSWORD", "FarmketTest@123")

    def add_arguments(self, parser):
        parser.add_argument(
            "--farmers",
            type=int,
            default=50,
            help="Number of farmer accounts to create (default: 50, max: 50).",
        )
        parser.add_argument(
            "--buyers",
            type=int,
            default=50,
            help="Number of buyer accounts to create (default: 50, max: 50).",
        )
        parser.add_argument(
            "--products-per-farmer",
            type=int,
            default=6,
            help="Number of products to create for each farmer (default: 6, min: 5).",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Simulate the seeding process without committing any database changes.",
        )
        parser.add_argument(
            "--reset-seed-data",
            action="store_true",
            help="Safely remove previously seeded records (*@farmket.test) before seeding.",
        )
        parser.add_argument(
            "--only-reset",
            action="store_true",
            help="Only delete seeded records and exit immediately without re-seeding.",
        )

    def handle(self, *args, **options):
        # Set deterministic random seed for reproducible pricing and dates
        random.seed(42)

        farmers_count = options["farmers"]
        buyers_count = options["buyers"]
        products_per_farmer = options["products_per_farmer"]
        dry_run = options["dry_run"]
        reset_seed_data = options["reset_seed_data"]
        only_reset = options["only_reset"]

        # Validate arguments
        if farmers_count < 1 or farmers_count > len(FARMERS_DATA):
            raise CommandError(
                f"--farmers must be between 1 and {len(FARMERS_DATA)}."
            )
        if buyers_count < 1 or buyers_count > len(BUYERS_DATA):
            raise CommandError(
                f"--buyers must be between 1 and {len(BUYERS_DATA)}."
            )
        if products_per_farmer < 5:
            raise CommandError(
                "--products-per-farmer must be at least 5 to satisfy marketplace requirements."
            )

        self.stdout.write(self.style.MIGRATE_HEADING("=" * 70))
        self.stdout.write(self.style.MIGRATE_HEADING("   FARMKET PRODUCTION-QUALITY SEED DATA GENERATOR"))
        self.stdout.write(self.style.MIGRATE_HEADING("=" * 70))
        self.stdout.write(f"Target Farmers             : {farmers_count}")
        self.stdout.write(f"Target Buyers              : {buyers_count}")
        self.stdout.write(f"Target Products/Farmer     : {products_per_farmer}")
        self.stdout.write(f"Estimated Total Products   : {farmers_count * products_per_farmer}")
        self.stdout.write(f"Dry Run Mode               : {'ENABLED' if dry_run else 'DISABLED'}")
        self.stdout.write(f"Seed Email Domain          : @{self.SEED_DOMAIN}")
        self.stdout.write(f"Seed Password              : {self.DEFAULT_PASSWORD}")
        self.stdout.write("=" * 70)

        # ── Step 1: Optional Reset of Seed Data ───────────────────────────────
        if reset_seed_data or only_reset:
            self.stdout.write(self.style.WARNING("\n[Step 1] Resetting seeded data..."))
            self._reset_seeded_records(dry_run=dry_run)
            if only_reset:
                self.stdout.write(self.style.SUCCESS("\n[SUCCESS] Seed data reset complete. Exiting (--only-reset)."))
                return

        # ── Step 2: Seed Categories, Users, Profiles, Products ────────────────
        try:
            with transaction.atomic():
                self.stdout.write(self.style.MIGRATE_LABEL("\n[Step 2] Seeding Product Categories..."))
                categories = self._seed_categories()

                self.stdout.write(self.style.MIGRATE_LABEL("\n[Step 3] Seeding Indian Farmers and Profiles..."))
                farmers = self._seed_farmers(count=farmers_count)

                self.stdout.write(self.style.MIGRATE_LABEL("\n[Step 4] Seeding Indian Buyers and Profiles..."))
                buyers = self._seed_buyers(count=buyers_count)

                self.stdout.write(self.style.MIGRATE_LABEL("\n[Step 5] Seeding Products per Farmer..."))
                products = self._seed_products(
                    farmers=farmers,
                    categories=categories,
                    products_per_farmer=products_per_farmer,
                )

                self.stdout.write(self.style.MIGRATE_LABEL("\n[Step 6] Seeding Optional Reviews, Crops, and Posts..."))
                reviews_count, crops_count, posts_count = self._seed_related_data(
                    farmers=farmers,
                    buyers=buyers,
                    products=products,
                )

                if dry_run:
                    self.stdout.write(
                        self.style.WARNING("\n[DRY RUN] Rolling back all database modifications.")
                    )
                    transaction.set_rollback(True)
                else:
                    self.stdout.write(self.style.SUCCESS("\n[SUCCESS] Database transaction committed successfully!"))

        except Exception as exc:
            self.stderr.write(self.style.ERROR(f"\n[FATAL ERROR] Seeding aborted: {exc}"))
            raise exc

        # ── Step 7: Print Summary Report ──────────────────────────────────────
        self._print_summary(
            farmers_count=farmers_count,
            buyers_count=buyers_count,
            categories_count=len(categories),
            products_count=len(products),
            products_per_farmer=products_per_farmer,
            reviews_count=reviews_count if not dry_run else 0,
            crops_count=crops_count if not dry_run else 0,
            posts_count=posts_count if not dry_run else 0,
            dry_run=dry_run,
        )

    # ─────────────────────────────────────────────────────────────────────────
    # Sub-routines
    # ─────────────────────────────────────────────────────────────────────────

    def _reset_seeded_records(self, dry_run=False):
        """Safely removes ONLY records with emails matching @farmket.test."""
        seeded_users = User.objects.filter(email__iendswith=f"@{self.SEED_DOMAIN}")
        user_count = seeded_users.count()
        seeded_user_ids = list(seeded_users.values_list("id", flat=True))

        farmer_profiles_count = FarmerProfile.objects.filter(user_id__in=seeded_user_ids).count()
        buyer_profiles_count = BuyerProfile.objects.filter(user_id__in=seeded_user_ids).count()
        products_count = Product.objects.filter(farmer_id__in=seeded_user_ids).count()
        crops_count = CropGrowth.objects.filter(farmer_id__in=seeded_user_ids).count()
        posts_count = Post.objects.filter(farmer_id__in=seeded_user_ids).count()

        self.stdout.write(
            f"  Identified {user_count} seeded users ({farmer_profiles_count} farmers, {buyer_profiles_count} buyers)."
        )
        self.stdout.write(
            f"  Associated records: {products_count} products, {crops_count} crop growths, {posts_count} posts."
        )

        if dry_run:
            self.stdout.write(self.style.WARNING("  [DRY RUN] Would delete seeded records. Skipped."))
            return

        with transaction.atomic():
            # Cascade deletion via User model will delete FarmerProfile, BuyerProfile,
            # Product, Review, CropGrowth, Post, etc.
            deleted_count, details = seeded_users.delete()
            self.stdout.write(self.style.SUCCESS(f"  Safely deleted {deleted_count} seeded records."))

    def _seed_categories(self):
        """Creates or retrieves master agricultural categories."""
        category_image_map = {
            "vegetables": "categories/Vegetables.png",
            "fruits": "categories/Fruits.png",
            "grains": "categories/Grains.png",
            "pulses": "categories/Grains.png",
            "spices": "categories/Spices_Cash_Crops.png",
            "dairy": "categories/Dairy_Animal_Products.png",
            "organic-produce": "categories/Vegetables.png",
            "oilseeds": "categories/Grains.png",
            "herbs": "categories/Vegetables.png",
        }

        categories = {}
        for cat_data in CATEGORIES_DATA:
            img_rel = category_image_map.get(cat_data["slug"])
            category, created = Category.objects.get_or_create(
                slug=cat_data["slug"],
                defaults={
                    "name": cat_data["name"],
                    "description": cat_data["description"],
                    "image": img_rel,
                    "is_active": True,
                },
            )
            if not created:
                updated = False
                if category.name != cat_data["name"]:
                    category.name = cat_data["name"]
                    updated = True
                if category.description != cat_data["description"]:
                    category.description = cat_data["description"]
                    updated = True
                if not category.image and img_rel:
                    category.image = img_rel
                    updated = True
                if updated:
                    category.save()

            categories[category.slug] = category
            status_text = "Created" if created else "Existing"
            self.stdout.write(f"  [{status_text}] Category: {category.name} ({category.slug})")
        return categories

    def _seed_farmers(self, count):
        """Creates realistic Indian farmer users and their farmer profiles."""
        seeded_farmers = []

        for i in range(count):
            index = i + 1
            data = FARMERS_DATA[i]
            region = REGIONS[i % len(REGIONS)]

            username = f"farmer{index:02d}"
            email = f"farmer{index:02d}@{self.SEED_DOMAIN}"
            phone = f"+91980001{index:04d}"
            full_address = (
                f"{data['farm_name']}, Village {region['village']}, "
                f"Taluk {region['taluk']}, District {region['district']}, "
                f"{region['state']} - {region['pincode']}"
            )

            # Create or update user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": username,
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "gender": data["gender"],
                    "user_type": "farmer",
                    "phone_number": phone,
                    "address": full_address,
                    "is_verified": True,
                    "is_active": True,
                    "token_version": 1,
                },
            )

            # Ensure attributes and password are set
            user.username = username
            user.first_name = data["first_name"]
            user.last_name = data["last_name"]
            user.gender = data["gender"]
            user.user_type = "farmer"
            user.phone_number = phone
            user.address = full_address
            user.is_verified = True
            user.is_active = True
            user.set_password(self.DEFAULT_PASSWORD)
            user.save()

            # Record initial password history for test compatibility
            try:
                record_password_history(user, self.DEFAULT_PASSWORD)
            except Exception:
                pass

            # Create or update FarmerProfile
            location_str = f"{region['district']}, {region['state']}"
            profile, prof_created = FarmerProfile.objects.update_or_create(
                user=user,
                defaults={
                    "farm_name": data["farm_name"],
                    "farm_size": data["farm_size"],
                    "location": location_str,
                    "latitude": region["lat"],
                    "longitude": region["lon"],
                    "organic_certified": data["organic_certified"],
                    "description": data["desc"],
                    "rating": data["rating"],
                    "total_sales": data["total_sales"],
                },
            )

            seeded_farmers.append((user, profile, region))

        self.stdout.write(f"  Created/Updated {len(seeded_farmers)} unique Farmer accounts.")
        return seeded_farmers

    def _seed_buyers(self, count):
        """Creates realistic Indian buyer users and their buyer profiles."""
        seeded_buyers = []

        for i in range(count):
            index = i + 1
            data = BUYERS_DATA[i]

            username = f"buyer{index:02d}"
            email = f"buyer{index:02d}@{self.SEED_DOMAIN}"
            phone = f"+91980002{index:04d}"

            # Create or update user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": username,
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "gender": data["gender"],
                    "user_type": "buyer",
                    "phone_number": phone,
                    "address": data["address"],
                    "is_verified": True,
                    "is_active": True,
                    "token_version": 1,
                },
            )

            user.username = username
            user.first_name = data["first_name"]
            user.last_name = data["last_name"]
            user.gender = data["gender"]
            user.user_type = "buyer"
            user.phone_number = phone
            user.address = data["address"]
            user.is_verified = True
            user.is_active = True
            user.set_password(self.DEFAULT_PASSWORD)
            user.save()

            # Record initial password history
            try:
                record_password_history(user, self.DEFAULT_PASSWORD)
            except Exception:
                pass

            # Create or update BuyerProfile
            profile, prof_created = BuyerProfile.objects.update_or_create(
                user=user,
                defaults={
                    "company_name": data["company_name"],
                    "delivery_address": data["address"],
                    "preferences": data["prefs"],
                },
            )

            seeded_buyers.append((user, profile, data))

        self.stdout.write(f"  Created/Updated {len(seeded_buyers)} unique Buyer accounts.")
        return seeded_buyers

    def _seed_products(self, farmers, categories, products_per_farmer):
        """
        Creates realistic agricultural products owned by each farmer.
        Guarantees every farmer has at least products_per_farmer products.
        Also creates ProductImage records referencing master media assets.
        """
        # Ensure master product media assets exist on disk
        media_products_dir = settings.MEDIA_ROOT / "products"
        generate_all_catalog_images(media_products_dir, PRODUCTS_CATALOG)

        seeded_products = []
        total_catalog = len(PRODUCTS_CATALOG)

        for farmer_idx, (farmer_user, farmer_profile, region) in enumerate(farmers):
            # Select appropriate crops for this farmer
            # Priority: products matching regional specialties
            matched_prods = []
            specialties_lower = [s.lower() for s in region.get("specialties", [])]

            for prod_data in PRODUCTS_CATALOG:
                prod_name_lower = prod_data["name"].lower()
                if any(spec in prod_name_lower for spec in specialties_lower):
                    matched_prods.append(prod_data)

            # Supplement with deterministic cyclic catalog products to reach products_per_farmer
            assigned_prods = list(matched_prods)
            offset = (farmer_idx * 7) % total_catalog
            for k in range(total_catalog):
                candidate = PRODUCTS_CATALOG[(offset + k) % total_catalog]
                if candidate not in assigned_prods:
                    assigned_prods.append(candidate)
                if len(assigned_prods) >= products_per_farmer:
                    break

            assigned_prods = assigned_prods[:products_per_farmer]

            # Generate Product instances
            for p_idx, prod_info in enumerate(assigned_prods):
                cat_slug = prod_info["category"]
                category = categories.get(cat_slug) or categories.get("vegetables")

                # Unique slug guaranteed per farmer and product within 50 chars
                prod_slug_part = slugify(prod_info["name"])[:37].strip("-")
                slug = f"{farmer_user.username}-{p_idx+1}-{prod_slug_part}"

                # Compute realistic price variance based on farmer and product
                min_p = prod_info["min_price"]
                max_p = prod_info["max_price"]
                # Spread price smoothly between min and max
                price_step = (max_p - min_p) * Decimal(str((farmer_idx * 3 + p_idx * 5) % 100)) / Decimal("100.0")
                final_price = (min_p + price_step).quantize(Decimal("0.01"))

                # Stock and minimum order
                min_stock, max_stock = prod_info["stock_range"]
                stock = min_stock + ((farmer_idx * 13 + p_idx * 17) % (max_stock - min_stock + 1))
                min_order = prod_info["min_order"]

                # Organic status aligned with farm or product definition
                is_organic = farmer_profile.organic_certified or prod_info.get("organic", False)

                # Recent or upcoming harvest date
                harvest_offset_days = ((farmer_idx * 5 + p_idx * 3) % 45) - 15
                harvest_date = date.today() + timedelta(days=harvest_offset_days)

                product, created = Product.objects.update_or_create(
                    slug=slug,
                    defaults={
                        "farmer": farmer_user,
                        "category": category,
                        "name": prod_info["name"],
                        "description": prod_info["desc"],
                        "price": final_price,
                        "unit": prod_info["unit"],
                        "stock_quantity": stock,
                        "minimum_order": min_order,
                        "is_organic": is_organic,
                        "harvest_date": harvest_date,
                        "is_available": True,
                        "views": 25 + ((farmer_idx * 7 + p_idx) % 250),
                    },
                )

                # Associate master product image
                crop_img_rel_path = f"products/{slugify(prod_info['name'])}.jpg"
                ProductImage.objects.update_or_create(
                    product=product,
                    defaults={
                        "image": crop_img_rel_path,
                        "is_primary": True,
                    },
                )

                seeded_products.append(product)

        self.stdout.write(
            f"  Created/Updated {len(seeded_products)} products with primary images across {len(farmers)} farmers "
            f"({products_per_farmer} products/farmer)."
        )
        return seeded_products

    def _seed_related_data(self, farmers, buyers, products):
        """
        Enriches test data with:
        1. Authentic customer reviews on select products
        2. CropGrowth tracking records enabling pre-booking testing
        3. Farmer social updates/posts
        """
        reviews_created = 0
        crops_created = 0
        posts_created = 0

        # 1. Product Reviews (1 review per 4 products from diverse buyers)
        for i, product in enumerate(products):
            if i % 4 == 0:
                buyer_user = buyers[(i * 3) % len(buyers)][0]
                review_template = REVIEW_COMMENTS[i % len(REVIEW_COMMENTS)]
                review, created = Review.objects.update_or_create(
                    product=product,
                    buyer=buyer_user,
                    defaults={
                        "rating": review_template["rating"],
                        "comment": review_template["comment"],
                    },
                )
                if created:
                    reviews_created += 1

        # 2. CropGrowth records (for ~30 products to test pre-booking lifecycle)
        stages = [CropStage.PLANTED, CropStage.GROWING, CropStage.NEAR_HARVEST]
        for i in range(min(35, len(products))):
            product = products[i]
            farmer_user = product.farmer
            stage = stages[i % len(stages)]
            sowing_date = date.today() - timedelta(days=30 + (i * 2))
            expected_harvest = date.today() + timedelta(days=15 + (i * 3))
            expected_qty = Decimal(str(300 + (i * 20)))

            crop_growth, created = CropGrowth.objects.update_or_create(
                farmer=farmer_user,
                product=product,
                defaults={
                    "sowing_date": sowing_date,
                    "expected_harvest_date": expected_harvest,
                    "expected_quantity": expected_qty,
                    "available_quantity": expected_qty,
                    "stage": stage,
                    "organic": product.is_organic,
                    "notes": f"High quality crop tracking batch for {product.name} under supervised drip irrigation.",
                },
            )
            if created:
                crops_created += 1

        # 3. Farmer Posts (for first 15 farmers to enrich social feed)
        for i in range(min(15, len(farmers))):
            farmer_user = farmers[i][0]
            farmer_profile = farmers[i][1]
            farmer_product = products[i * 6] if (i * 6) < len(products) else None

            post_title = f"Fresh Harvest Update from {farmer_profile.farm_name}"
            post_desc = (
                f"We are beginning our peak season harvest here in {farmer_profile.location}! "
                f"Fresh batches are now live on our Farmket storefront with zero middlemen."
            )
            post, created = Post.objects.update_or_create(
                farmer=farmer_user,
                title=post_title,
                defaults={
                    "product": farmer_product,
                    "category": farmer_product.category if farmer_product else None,
                    "description": post_desc,
                    "location": farmer_profile.location,
                    "hashtags": ["#FreshHarvest", "#FarmDirect", "#IndianFarming", "#OrganicProduce"],
                    "visibility": "public",
                    "status": "active",
                },
            )
            if created:
                posts_created += 1

        self.stdout.write(
            f"  Created {reviews_created} reviews, {crops_created} crop growths, {posts_created} farmer posts."
        )
        return reviews_created, crops_created, posts_created

    def _print_summary(
        self,
        farmers_count,
        buyers_count,
        categories_count,
        products_count,
        products_per_farmer,
        reviews_count,
        crops_count,
        posts_count,
        dry_run,
    ):
        """Displays formatted final seeding status and login reference."""
        self.stdout.write("\n" + "=" * 70)
        self.stdout.write(self.style.SUCCESS("   FARMKET DATABASE SEEDING COMPLETED SUCCESSFULLY!"))
        self.stdout.write("=" * 70)
        mode_str = "[SIMULATED - DRY RUN]" if dry_run else "[COMMITTED TO DATABASE]"
        self.stdout.write(f"Execution Mode            : {mode_str}")
        self.stdout.write(f"Total Farmers Seeded      : {farmers_count}")
        self.stdout.write(f"Total Buyers Seeded       : {buyers_count}")
        self.stdout.write(f"Total Categories Seeded   : {categories_count}")
        self.stdout.write(f"Total Products Seeded     : {products_count}")
        self.stdout.write(f"Product Images Seeded     : {products_count} (100% catalog coverage)")
        self.stdout.write(f"Products Per Farmer       : {products_per_farmer} (Guaranteed min: >= 5)")
        self.stdout.write(f"Customer Reviews Seeded   : {reviews_count}")
        self.stdout.write(f"Crop Tracking Seeded      : {crops_count}")
        self.stdout.write(f"Farmer Social Posts Seeded: {posts_count}")
        self.stdout.write("-" * 70)
        self.stdout.write(self.style.MIGRATE_HEADING("TEST CREDENTIALS REFERENCE (All passwords: FarmketTest@123):"))
        self.stdout.write(f"  Farmer Sample #1        : farmer01@{self.SEED_DOMAIN}  (Rahul Patil - Sahyadri Agro)")
        self.stdout.write(f"  Farmer Sample #2        : farmer02@{self.SEED_DOMAIN}  (Suresh Jadhav - Jadhav Krishi)")
        self.stdout.write(f"  Farmer Sample #50       : farmer50@{self.SEED_DOMAIN}  (Shambhu Sharan - Mithila Litchi)")
        self.stdout.write(f"  Buyer Sample #1         : buyer01@{self.SEED_DOMAIN}   (Ananya Deshmukh - Household)")
        self.stdout.write(f"  Buyer Sample #19        : buyer19@{self.SEED_DOMAIN}   (Chef Ajay Chopra - Restaurant)")
        self.stdout.write(f"  Buyer Sample #31        : buyer31@{self.SEED_DOMAIN}   (Mohan Gupta - Grocery Mart)")
        self.stdout.write(f"  Buyer Sample #50        : buyer50@{self.SEED_DOMAIN}   (Geeta Agarwal - Organic Club)")
        self.stdout.write("=" * 70 + "\n")
