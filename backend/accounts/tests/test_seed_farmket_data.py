from django.core.management import call_command
from django.test import TestCase
from accounts.models import User, FarmerProfile, BuyerProfile
from products.models import Product, Category


class SeedFarmketDataCommandTest(TestCase):
    """
    Automated test for seed_farmket_data management command.
    Verifies dry-run, seeding, counts, relationships, and reset flags.
    """

    def test_dry_run_does_not_persist_data(self):
        call_command('seed_farmket_data', farmers=2, buyers=2, products_per_farmer=5, dry_run=True)
        self.assertEqual(User.objects.filter(email__endswith='@farmket.test').count(), 0)
        self.assertEqual(Product.objects.count(), 0)

    def test_seed_command_creates_expected_records(self):
        call_command('seed_farmket_data', farmers=3, buyers=3, products_per_farmer=5)

        # Check user counts
        self.assertEqual(User.objects.filter(user_type='farmer', email__endswith='@farmket.test').count(), 3)
        self.assertEqual(User.objects.filter(user_type='buyer', email__endswith='@farmket.test').count(), 3)

        # Check profiles
        self.assertEqual(FarmerProfile.objects.filter(user__email__endswith='@farmket.test').count(), 3)
        self.assertEqual(BuyerProfile.objects.filter(user__email__endswith='@farmket.test').count(), 3)

        # Check products
        self.assertEqual(Product.objects.count(), 15)  # 3 farmers * 5 products = 15

        # Check products per farmer
        for farmer in User.objects.filter(user_type='farmer', email__endswith='@farmket.test'):
            self.assertEqual(farmer.products.count(), 5)

        # Check categories
        self.assertGreater(Category.objects.count(), 0)

    def test_seed_command_idempotency(self):
        # Run twice
        call_command('seed_farmket_data', farmers=2, buyers=2, products_per_farmer=5)
        call_command('seed_farmket_data', farmers=2, buyers=2, products_per_farmer=5)

        self.assertEqual(User.objects.filter(user_type='farmer', email__endswith='@farmket.test').count(), 2)
        self.assertEqual(User.objects.filter(user_type='buyer', email__endswith='@farmket.test').count(), 2)
        self.assertEqual(Product.objects.count(), 10)

    def test_seed_command_reset(self):
        call_command('seed_farmket_data', farmers=2, buyers=2, products_per_farmer=5)
        self.assertEqual(User.objects.filter(email__endswith='@farmket.test').count(), 4)

        call_command('seed_farmket_data', only_reset=True)
        self.assertEqual(User.objects.filter(email__endswith='@farmket.test').count(), 0)
        self.assertEqual(Product.objects.count(), 0)

