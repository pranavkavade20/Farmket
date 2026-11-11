"""
Download authentic, real, watermark-free product photographs for Farmket
Indian agricultural produce catalog (63 distinct items) from open sources
(Wikimedia Commons PageImages API and Unsplash high-res assets).
"""
import os
import io
import json
import urllib.request
import urllib.parse
from PIL import Image

MEDIA_DIR = os.path.join(os.path.dirname(__file__), "media", "products")
os.makedirs(MEDIA_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "FarmketCatalogBot/1.0 (https://farmket.test; dev@farmket.test)"
}

# Accurate Wikipedia article titles for each crop
CROP_WIKI_TITLES = {
    # Vegetables
    "nashik-red-onion": "Red_onion",
    "organic-red-tomatoes": "Tomato",
    "agra-chipsona-potato": "Potato",
    "fresh-green-chilli-hari-mirch": "Chili_pepper",
    "organic-baby-spinach-palak": "Spinach",
    "tender-okra-bhindi": "Okra",
    "green-bell-pepper-capsicum": "Bell_pepper",
    "farm-fresh-cauliflower": "Cauliflower",
    "green-cabbage": "Cabbage",
    "bottle-gourd-lauki-dudhi": "Calabash",
    "bitter-gourd-karela": "Momordica_charantia",
    "red-carrots-desi-gajar": "Carrot",
    "fresh-cucumber-desi-kheera": "Cucumber",
    "purple-brinjal-baingan": "Eggplant",
    "moringa-drumsticks-sahjan": "Moringa_oleifera",
    # Fruits
    "devgad-alphonso-mango-hapus": "Alphonso_mango",
    "talala-gir-kesar-mango": "Mango",
    "malihabad-dasheri-mango": "Mango",
    "robusta-table-banana-kela": "Banana",
    "bhagwa-pomegranate-anar": "Pomegranate",
    "organic-red-guava-amrood": "Guava",
    "sweet-red-watermelon-tarbooz": "Watermelon",
    "organic-papaya-desi": "Papaya",
    "thomson-seedless-green-grapes": "Sultana_(grape)",
    "nagpur-mandarin-orange-santra": "Mandarin_orange",
    "royal-delicious-apple-kinnaurshimla": "Apple",
    "muzaffarpur-shahi-litchi": "Lychee",
    # Grains
    "aged-1121-pusa-basmati-rice": "Basmati",
    "sehore-sharbati-golden-wheat": "Wheat",
    "traditional-sona-masoori-rice-raw": "Sona_masuri",
    "gobindobhog-fragrant-rice": "White_rice",
    "organic-finger-millet-ragi-whole-grain": "Finger_millet",
    "desi-pearl-millet-bajra-grain": "Pearl_millet",
    "sorghum-whole-grain-jowar": "Sorghum",
    "yellow-maize-kernels-makka": "Corn_kernel",
    # Pulses
    "unpolished-toor-dal-arhar-dal": "Pigeon_pea",
    "desi-moong-dal-yellow-split": "Mung_bean",
    "whole-green-moong-green-gram": "Mung_bean",
    "desi-kala-chana-brown-chickpeas": "Chickpea",
    "bold-kabuli-chana-white-chickpeas": "Chickpea",
    "red-masoor-dal-split-red-lentils": "Lentil",
    "unpolished-urad-dal-black-gram-split": "Vigna_mungo",
    # Spices
    "organic-salem-turmeric-powder": "Turmeric",
    "wayanad-bold-black-pepper": "Black_pepper",
    "idukki-green-cardamom-elaichi": "Cardamom",
    "guntur-sannam-s4-dried-red-chilli": "Guntur_chilli",
    "nagauri-whole-cumin-seeds-jeera": "Cumin",
    "ramganj-mandi-coriander-seeds-dhania": "Coriander",
    "fresh-ginger-adrak": "Ginger",
    "single-clove-garlic-desi-lehsun": "Garlic",
    # Dairy
    "gir-cow-a2-raw-milk": "Milk",
    "desi-cow-vedic-bilona-ghee": "Clarified_butter",
    "fresh-farm-malai-paneer": "Paneer",
    "cultured-desi-butter-makkhan": "Butter",
    # Oilseeds
    "saurashtra-groundnut-seeds-moongphali": "Peanut",
    "yellow-mustard-seeds-sarson": "Mustard_seed",
    "white-sesame-seeds-desi-til": "Sesame",
    "malwa-yellow-soybean": "Soybean",
    # Herbs
    "fresh-holy-basil-desi-tulsi": "Ocimum_tenuiflorum",
    "fresh-coriander-leaves-kothmir": "Coriander",
    "fresh-garden-mint-pudina": "Spearmint",
    "fresh-curry-leaves-kadi-patta": "Curry_tree",
    "organic-lemongrass-stalks": "Cymbopogon",
}

# Curated high-res Unsplash / Wikimedia photograph fallbacks
CURATED_FALLBACKS = {
    "nashik-red-onion": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80",
    "organic-red-tomatoes": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
    "agra-chipsona-potato": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80",
    "fresh-green-chilli-hari-mirch": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80",
    "organic-baby-spinach-palak": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80",
    "tender-okra-bhindi": "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=800&auto=format&fit=crop&q=80",
    "green-bell-pepper-capsicum": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&auto=format&fit=crop&q=80",
    "farm-fresh-cauliflower": "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=800&auto=format&fit=crop&q=80",
    "green-cabbage": "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=800&auto=format&fit=crop&q=80",
    "red-carrots-desi-gajar": "https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=800&auto=format&fit=crop&q=80",
    "fresh-cucumber-desi-kheera": "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=800&auto=format&fit=crop&q=80",
    "purple-brinjal-baingan": "https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=800&auto=format&fit=crop&q=80",
    "devgad-alphonso-mango-hapus": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80",
    "talala-gir-kesar-mango": "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=800&auto=format&fit=crop&q=80",
    "malihabad-dasheri-mango": "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&auto=format&fit=crop&q=80",
    "robusta-table-banana-kela": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80",
    "bhagwa-pomegranate-anar": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80",
    "organic-red-guava-amrood": "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=800&auto=format&fit=crop&q=80",
    "sweet-red-watermelon-tarbooz": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80",
    "organic-papaya-desi": "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=800&auto=format&fit=crop&q=80",
    "thomson-seedless-green-grapes": "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&auto=format&fit=crop&q=80",
    "nagpur-mandarin-orange-santra": "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&auto=format&fit=crop&q=80",
    "royal-delicious-apple-kinnaurshimla": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80",
    "muzaffarpur-shahi-litchi": "https://images.unsplash.com/photo-1584306670957-acf935f5033c?w=800&auto=format&fit=crop&q=80",
    "aged-1121-pusa-basmati-rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80",
    "traditional-sona-masoori-rice-raw": "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop&q=80",
    "sehore-sharbati-golden-wheat": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80",
    "yellow-maize-kernels-makka": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=80",
    "bold-kabuli-chana-white-chickpeas": "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=800&auto=format&fit=crop&q=80",
    "organic-salem-turmeric-powder": "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&auto=format&fit=crop&q=80",
    "wayanad-bold-black-pepper": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=80",
    "idukki-green-cardamom-elaichi": "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800&auto=format&fit=crop&q=80",
    "guntur-sannam-s4-dried-red-chilli": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80",
    "fresh-ginger-adrak": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80",
    "single-clove-garlic-desi-lehsun": "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=800&auto=format&fit=crop&q=80",
    "gir-cow-a2-raw-milk": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=80",
    "desi-cow-vedic-bilona-ghee": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&auto=format&fit=crop&q=80",
    "fresh-farm-malai-paneer": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80",
    "cultured-desi-butter-makkhan": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&auto=format&fit=crop&q=80",
    "saurashtra-groundnut-seeds-moongphali": "https://images.unsplash.com/photo-1567892328224-e1b0d832849a?w=800&auto=format&fit=crop&q=80",
    "fresh-coriander-leaves-kothmir": "https://images.unsplash.com/photo-1589135233689-d56037e90899?w=800&auto=format&fit=crop&q=80",
    "fresh-garden-mint-pudina": "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=800&auto=format&fit=crop&q=80",
}


def fit_and_crop(img: Image.Image, target_size=(800, 600)) -> Image.Image:
    """Center crop and resize to standard catalog dimensions."""
    img = img.convert("RGB")
    target_w, target_h = target_size
    img_w, img_h = img.size

    ratio = max(target_w / img_w, target_h / img_h)
    new_w = max(target_w, int(img_w * ratio))
    new_h = max(target_h, int(img_h * ratio))

    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def fetch_image_from_url(url: str, timeout: int = 10) -> Image.Image:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        content = resp.read()
        return Image.open(io.BytesIO(content))


def fetch_wikipedia_pageimage(page_title: str) -> str:
    """Fetch high-res original photograph via MediaWiki pageimages API."""
    query_url = (
        f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(page_title)}"
        "&prop=pageimages&piprop=original|thumbnail&pithumbsize=800&format=json"
    )
    req = urllib.request.Request(query_url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=8) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        pages = data.get("query", {}).get("pages", {})
        for pid, pinfo in pages.items():
            if "original" in pinfo and pinfo["original"].get("source"):
                src = pinfo["original"]["source"]
                if not src.lower().endswith(".svg"):
                    return src
            if "thumbnail" in pinfo and pinfo["thumbnail"].get("source"):
                src = pinfo["thumbnail"]["source"]
                if not src.lower().endswith(".svg"):
                    return src
    return None


def download_all_real_images():
    print("=" * 70)
    print("FARMKET REAL PRODUCT PHOTOGRAPHY GENERATOR")
    print("Downloading 100% authentic, watermark-free images for all 63 crops")
    print("=" * 70)

    total = len(CROP_WIKI_TITLES)
    success = 0

    for idx, (crop_slug, wiki_title) in enumerate(CROP_WIKI_TITLES.items(), start=1):
        target_file = os.path.join(MEDIA_DIR, f"{crop_slug}.jpg")

        # Skip if already downloaded as an authentic photo (size > 20KB and not a banner)
        # We want to ensure all 63 are genuine downloaded photos
        print(f"[{idx:2d}/{total:2d}] Sourcing real photo for: {crop_slug}...")

        candidates = []
        # 1. Curated un-watermarked photo if present
        if crop_slug in CURATED_FALLBACKS:
            candidates.append(CURATED_FALLBACKS[crop_slug])

        # 2. Wikipedia original pageimage
        try:
            wiki_url = fetch_wikipedia_pageimage(wiki_title)
            if wiki_url and wiki_url not in candidates:
                candidates.append(wiki_url)
        except Exception:
            pass

        img_obj = None
        source_url = None

        for url in candidates:
            try:
                downloaded = fetch_image_from_url(url, timeout=12)
                if downloaded.width >= 200 and downloaded.height >= 200:
                    img_obj = downloaded
                    source_url = url
                    break
            except Exception:
                continue

        if img_obj:
            try:
                processed = fit_and_crop(img_obj, target_size=(800, 600))
                processed.save(target_file, "JPEG", quality=88, optimize=True)
                sz_kb = os.path.getsize(target_file) / 1024
                print(f"    -> Saved {crop_slug}.jpg ({sz_kb:.1f} KB) from: {source_url[:48]}...")
                success += 1
            except Exception as e:
                print(f"    -> ERROR processing image for {crop_slug}: {e}")
        else:
            print(f"    -> FAILED to find image for {crop_slug}")

    print("=" * 70)
    print(f"COMPLETED: {success}/{total} authentic photos ready in {MEDIA_DIR}")
    print("=" * 70)


if __name__ == "__main__":
    download_all_real_images()
