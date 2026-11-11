import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'farmket.settings')
django.setup()

from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User

client = APIClient()

print("=" * 60)
print("FARMKET API COMPATIBILITY & TEST SUITE FOR SEEDED DATA")
print("=" * 60)

# ── 1. Farmer Login Test ──
login_payload = {
    "email": "farmer01@farmket.test",
    "password": "FarmketTest@123"
}
res = client.post("/api/accounts/login/", login_payload, format="json")
print(f"1. Farmer Login (farmer01@farmket.test): Status {res.status_code}")
assert res.status_code == status.HTTP_200_OK, f"Login failed: {res.data}"
farmer_token = res.data["access"]
farmer_user_data = res.data["user"]
print(f"   Logged in as: {farmer_user_data['full_name']} ({farmer_user_data['user_type']})")
print(f"   JWT token version: {res.data.get('token_version', 'Valid')}")

# ── 2. Buyer Login Test ──
login_payload = {
    "email": "buyer01@farmket.test",
    "password": "FarmketTest@123"
}
res = client.post("/api/accounts/login/", login_payload, format="json")
print(f"\n2. Buyer Login (buyer01@farmket.test): Status {res.status_code}")
assert res.status_code == status.HTTP_200_OK, f"Login failed: {res.data}"
buyer_token = res.data["access"]
buyer_user_data = res.data["user"]
print(f"   Logged in as: {buyer_user_data['full_name']} ({buyer_user_data['user_type']})")

# ── 3. Category Listing API ──
res = client.get("/api/products/categories/")
print(f"\n3. Categories Listing API (/api/products/categories/): Status {res.status_code}")
assert res.status_code == status.HTTP_200_OK
categories = res.data.get("results", res.data)
print(f"   Retrieved {len(categories)} categories: {[c['name'] for c in categories[:5]]}...")

# ── 4. Farmer Profiles Listing API ──
res = client.get("/api/accounts/farmers/")
print(f"\n4. Farmer Profiles Listing API (/api/accounts/farmers/): Status {res.status_code}")
assert res.status_code == status.HTTP_200_OK
farmers_data = res.data.get("results", res.data)
print(f"   Retrieved {len(farmers_data)} farmers. Sample: {farmers_data[0]['farm_name']} at {farmers_data[0]['location']}")

# ── 5. Product Listing API & Pagination ──
res = client.get("/api/products/products/")
print(f"\n5. Product Listing API (/api/products/products/): Status {res.status_code}")
assert res.status_code == status.HTTP_200_OK
total_count = res.data.get("count", len(res.data))
page_size = len(res.data.get("results", []))
print(f"   Total marketplace products reported: {total_count}, Page 1 items: {page_size}")

# ── 6. Product Search Filtering ──
res = client.get("/api/products/products/?search=Tomato")
print(f"\n6. Product Search API (?search=Tomato): Status {res.status_code}")
assert res.status_code == status.HTTP_200_OK
search_count = res.data.get("count", len(res.data.get("results", [])))
print(f"   Found {search_count} tomato products matching query.")

# ── 7. Category Slug Filter ──
res = client.get("/api/products/products/?category__slug=fruits")
print(f"\n7. Category Filter (?category__slug=fruits): Status {res.status_code}")
assert res.status_code == status.HTTP_200_OK
fruits_count = res.data.get("count", len(res.data.get("results", [])))
print(f"   Found {fruits_count} fruit products.")

# ── 8. Organic Status Filter ──
res = client.get("/api/products/products/?is_organic=true")
print(f"\n8. Organic Filter (?is_organic=true): Status {res.status_code}")
assert res.status_code == status.HTTP_200_OK
organic_count = res.data.get("count", len(res.data.get("results", [])))
print(f"   Found {organic_count} organic certified products.")

# ── 9. Product Detail API ──
first_product = client.get("/api/products/products/").data["results"][0]
first_slug = first_product["slug"]
res = client.get(f"/api/products/products/{first_slug}/")
print(f"\n9. Product Detail API (/api/products/products/{first_slug}/): Status {res.status_code}")
assert res.status_code == status.HTTP_200_OK
print(f"   Product: {res.data['name']} | Price: INR {res.data['price']}/{res.data['unit']} | Farmer: {res.data['farmer_name']}")
print(f"   Market State: {res.data['market_state']} | Stock: {res.data['stock_quantity']} {res.data['unit']}")
print(f"   Images: {len(res.data.get('images', []))} image(s) attached. Sample image URL: {res.data['images'][0]['image'] if res.data.get('images') else 'None'}")
assert len(res.data.get('images', [])) > 0, "Product must have at least one image!"
assert "media/products/" in res.data['images'][0]['image'], "Image URL should point to media/products/"

# ── 10. Authenticated Buyer Profile API ──
client.credentials(HTTP_AUTHORIZATION=f"Bearer {buyer_token}")
res = client.get("/api/accounts/buyers/")
print(f"\n10. Authenticated Buyer Profile API: Status {res.status_code}")
assert res.status_code == status.HTTP_200_OK
buyer_profile_data = res.data.get("results", res.data)
print(f"   Buyer profile retrieved: {buyer_profile_data[0]['delivery_address'][:60]}...")

# ── 11. Farmer-Specific Products ──
farmer_user = User.objects.get(email="farmer01@farmket.test")
res = client.get(f"/api/products/products/?farmer={farmer_user.id}")
print(f"\n11. Farmer Filter API (?farmer={farmer_user.id}): Status {res.status_code}")
assert res.status_code == status.HTTP_200_OK
farmer_prods_count = res.data.get("count", len(res.data.get("results", [])))
print(f"   Farmer01 owns {farmer_prods_count} products.")
assert farmer_prods_count >= 5, "Farmer should have at least 5 products!"

print("\n" + "=" * 60)
print("ALL 11 API ENDPOINT TESTS PASSED WITH 100% SUCCESS!")
print("=" * 60)

