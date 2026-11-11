"""
Programmatic High-Quality Agricultural Image Generator for Farmket Products.
Generates 800x600 web-optimized visual assets for all crops in PRODUCTS_CATALOG
and stores them inside backend/media/products/.
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from django.utils.text import slugify

# Color styling per crop
CROP_STYLES = {
    # Vegetables
    "Nashik Red Onion": {"bg1": (92, 29, 56), "bg2": (35, 8, 20), "accent": (233, 30, 99), "badge": "FRESH VEGETABLES", "symbol": "🧅"},
    "Organic Red Tomatoes": {"bg1": (183, 28, 28), "bg2": (60, 9, 9), "accent": (255, 82, 82), "badge": "ORGANIC VEGETABLES", "symbol": "🍅"},
    "Agra Chipsona Potato": {"bg1": (93, 64, 55), "bg2": (35, 20, 14), "accent": (215, 204, 200), "badge": "FARM VEGETABLES", "symbol": "🥔"},
    "Fresh Green Chilli (Hari Mirch)": {"bg1": (27, 94, 32), "bg2": (10, 45, 14), "accent": (76, 175, 80), "badge": "FRESH VEGETABLES", "symbol": "🌶️"},
    "Organic Baby Spinach (Palak)": {"bg1": (10, 61, 36), "bg2": (4, 30, 16), "accent": (102, 187, 106), "badge": "LEAFY GREENS", "symbol": "🥬"},
    "Tender Okra (Bhindi)": {"bg1": (46, 74, 31), "bg2": (18, 35, 12), "accent": (139, 195, 74), "badge": "FRESH VEGETABLES", "symbol": "🌿"},
    "Green Bell Pepper (Capsicum)": {"bg1": (30, 86, 49), "bg2": (12, 38, 20), "accent": (76, 175, 80), "badge": "POLYHOUSE GREENS", "symbol": "🫑"},
    "Farm Fresh Cauliflower": {"bg1": (45, 90, 39), "bg2": (16, 40, 14), "accent": (245, 245, 245), "badge": "FRESH VEGETABLES", "symbol": "🥦"},
    "Green Cabbage": {"bg1": (37, 82, 59), "bg2": (14, 38, 26), "accent": (129, 199, 132), "badge": "FRESH VEGETABLES", "symbol": "🥬"},
    "Bottle Gourd (Lauki / Dudhi)": {"bg1": (40, 83, 59), "bg2": (15, 38, 25), "accent": (165, 214, 167), "badge": "ORGANIC VEGETABLES", "symbol": "🥒"},
    "Bitter Gourd (Karela)": {"bg1": (27, 67, 50), "bg2": (8, 28, 21), "accent": (102, 187, 106), "badge": "MEDICINAL GREENS", "symbol": "🥒"},
    "Red Carrots (Desi Gajar)": {"bg1": (216, 67, 21), "bg2": (90, 25, 6), "accent": (255, 138, 101), "badge": "ROOT VEGETABLES", "symbol": "🥕"},
    "Fresh Cucumber (Desi Kheera)": {"bg1": (39, 83, 56), "bg2": (14, 38, 24), "accent": (129, 199, 132), "badge": "SALAD GREENS", "symbol": "🥒"},
    "Purple Brinjal (Baingan)": {"bg1": (49, 27, 146), "bg2": (18, 7, 67), "accent": (179, 157, 219), "badge": "FRESH VEGETABLES", "symbol": "🍆"},
    "Moringa Drumsticks (Sahjan)": {"bg1": (35, 77, 32), "bg2": (12, 35, 11), "accent": (139, 195, 74), "badge": "SUPERFOOD VEGETABLES", "symbol": "🎋"},

    # Fruits
    "Devgad Alphonso Mango (Hapus)": {"bg1": (230, 81, 0), "bg2": (100, 30, 0), "accent": (255, 213, 79), "badge": "GI-TAGGED FRUITS", "symbol": "🥭"},
    "Talala Gir Kesar Mango": {"bg1": (245, 124, 0), "bg2": (110, 45, 0), "accent": (255, 224, 130), "badge": "GI-TAGGED FRUITS", "symbol": "🥭"},
    "Malihabad Dasheri Mango": {"bg1": (191, 113, 0), "bg2": (85, 45, 0), "accent": (255, 238, 88), "badge": "ROYAL HERITAGE FRUITS", "symbol": "🥭"},
    "Robusta Table Banana (Kela)": {"bg1": (230, 138, 0), "bg2": (100, 55, 0), "accent": (255, 235, 59), "badge": "ORCHARD FRUITS", "symbol": "🍌"},
    "Bhagwa Pomegranate (Anar)": {"bg1": (136, 14, 79), "bg2": (55, 4, 30), "accent": (240, 98, 146), "badge": "ANTIOXIDANT FRUITS", "symbol": "🍎"},
    "Organic Red Guava (Amrood)": {"bg1": (46, 91, 56), "bg2": (16, 40, 22), "accent": (244, 143, 177), "badge": "ORGANIC FRUITS", "symbol": "🍈"},
    "Sweet Red Watermelon (Tarbooz)": {"bg1": (183, 28, 28), "bg2": (40, 50, 30), "accent": (239, 83, 80), "badge": "SUMMER HARVEST", "symbol": "🍉"},
    "Organic Papaya (Desi)": {"bg1": (230, 81, 0), "bg2": (95, 30, 0), "accent": (255, 183, 77), "badge": "ORGANIC ORCHARD", "symbol": "🍈"},
    "Thomson Seedless Green Grapes": {"bg1": (27, 77, 46), "bg2": (10, 35, 18), "accent": (165, 214, 167), "badge": "VINEYARD HARVEST", "symbol": "🍇"},
    "Nagpur Mandarin Orange (Santra)": {"bg1": (230, 81, 0), "bg2": (110, 35, 0), "accent": (255, 183, 77), "badge": "CITRUS ORCHARD", "symbol": "🍊"},
    "Royal Delicious Apple (Kinnaur/Shimla)": {"bg1": (136, 19, 55), "bg2": (50, 6, 18), "accent": (244, 63, 94), "badge": "HIMALAYAN FRUITS", "symbol": "🍎"},
    "Muzaffarpur Shahi Litchi": {"bg1": (159, 18, 57), "bg2": (65, 5, 22), "accent": (251, 113, 133), "badge": "GI-TAGGED FRUITS", "symbol": "🍒"},

    # Grains
    "Aged 1121 Pusa Basmati Rice": {"bg1": (66, 49, 27), "bg2": (28, 19, 8), "accent": (234, 179, 8), "badge": "ROYAL AROMATIC RICE", "symbol": "🌾"},
    "Sehore Sharbati Golden Wheat": {"bg1": (107, 68, 18), "bg2": (45, 26, 4), "accent": (251, 191, 36), "badge": "GOLDEN HARVEST WHEAT", "symbol": "🌾"},
    "Traditional Sona Masoori Rice (Raw)": {"bg1": (76, 59, 32), "bg2": (32, 23, 10), "accent": (245, 213, 120), "badge": "STAPLE GRAINS", "symbol": "🌾"},
    "Gobindobhog Fragrant Rice": {"bg1": (82, 54, 18), "bg2": (35, 20, 5), "accent": (253, 224, 71), "badge": "HERITAGE SCENTED RICE", "symbol": "🌾"},
    "Organic Finger Millet (Ragi Whole Grain)": {"bg1": (74, 40, 16), "bg2": (30, 14, 4), "accent": (188, 120, 95), "badge": "ORGANIC SUPER GRAIN", "symbol": "🌾"},
    "Desi Pearl Millet (Bajra Grain)": {"bg1": (84, 65, 35), "bg2": (35, 25, 12), "accent": (215, 204, 200), "badge": "ANCIENT MILLETS", "symbol": "🌾"},
    "Sorghum Whole Grain (Jowar)": {"bg1": (78, 62, 44), "bg2": (30, 22, 13), "accent": (230, 215, 195), "badge": "NUTRITIVE MILLETS", "symbol": "🌾"},
    "Yellow Maize Kernels (Makka)": {"bg1": (102, 77, 3), "bg2": (40, 29, 0), "accent": (253, 224, 71), "badge": "WHOLE GRAINS", "symbol": "🌽"},

    # Pulses
    "Unpolished Toor Dal (Arhar Dal)": {"bg1": (102, 77, 0), "bg2": (38, 28, 0), "accent": (245, 158, 11), "badge": "UNPOLISHED PULSES", "symbol": "🍲"},
    "Desi Moong Dal (Yellow Split)": {"bg1": (92, 77, 0), "bg2": (35, 28, 0), "accent": (234, 179, 8), "badge": "PROTEIN RICH PULSES", "symbol": "🍲"},
    "Whole Green Moong (Green Gram)": {"bg1": (28, 68, 36), "bg2": (10, 30, 14), "accent": (74, 222, 128), "badge": "SPROUTING PULSES", "symbol": "🌱"},
    "Desi Kala Chana (Brown Chickpeas)": {"bg1": (62, 39, 35), "bg2": (24, 10, 8), "accent": (161, 136, 127), "badge": "HIGH FIBRE PULSES", "symbol": "🌰"},
    "Bold Kabuli Chana (White Chickpeas)": {"bg1": (78, 64, 57), "bg2": (28, 22, 19), "accent": (224, 224, 224), "badge": "EXTRA BOLD PULSES", "symbol": "🌰"},
    "Red Masoor Dal (Split Red Lentils)": {"bg1": (124, 45, 18), "bg2": (48, 14, 4), "accent": (249, 115, 22), "badge": "QUICK COOK PULSES", "symbol": "🍲"},
    "Unpolished Urad Dal (Black Gram Split)": {"bg1": (39, 39, 42), "bg2": (12, 12, 14), "accent": (212, 212, 216), "badge": "FERMENTATION PULSES", "symbol": "🍲"},

    # Spices
    "Organic Salem Turmeric Powder": {"bg1": (113, 63, 18), "bg2": (42, 20, 3), "accent": (250, 204, 21), "badge": "HIGH CURCUMIN SPICES", "symbol": "✨"},
    "Wayanad Bold Black Pepper": {"bg1": (24, 24, 27), "bg2": (9, 9, 11), "accent": (161, 161, 170), "badge": "KING OF SPICES", "symbol": "🌿"},
    "Idukki Green Cardamom (Elaichi)": {"bg1": (20, 61, 34), "bg2": (6, 26, 12), "accent": (74, 222, 128), "badge": "QUEEN OF SPICES", "symbol": "🌿"},
    "Guntur Sannam S4 Dried Red Chilli": {"bg1": (127, 29, 29), "bg2": (48, 7, 7), "accent": (239, 68, 68), "badge": "SUN-DRIED SPICES", "symbol": "🌶️"},
    "Nagauri Whole Cumin Seeds (Jeera)": {"bg1": (63, 46, 24), "bg2": (22, 15, 6), "accent": (217, 119, 6), "badge": "AROMATIC WHOLE SPICES", "symbol": "🌿"},
    "Ramganj Mandi Coriander Seeds (Dhania)": {"bg1": (62, 52, 25), "bg2": (21, 17, 6), "accent": (202, 138, 4), "badge": "WHOLE SPICE SEEDS", "symbol": "🌿"},
    "Fresh Ginger (Adrak)": {"bg1": (87, 64, 36), "bg2": (32, 22, 10), "accent": (217, 119, 6), "badge": "FRESH SPICE ROOTS", "symbol": "🫚"},
    "Single Clove Garlic (Desi Lehsun)": {"bg1": (51, 47, 56), "bg2": (18, 15, 21), "accent": (244, 244, 245), "badge": "MEDICINAL ALLIUM", "symbol": "🧄"},

    # Dairy
    "Gir Cow A2 Raw Milk": {"bg1": (15, 59, 86), "bg2": (5, 25, 38), "accent": (56, 189, 248), "badge": "PURE A2 DAIRY", "symbol": "🥛"},
    "Desi Cow Vedic Bilona Ghee": {"bg1": (107, 78, 5), "bg2": (40, 27, 0), "accent": (250, 204, 21), "badge": "BILONA CHURNED GHEE", "symbol": "🧈"},
    "Fresh Farm Malai Paneer": {"bg1": (27, 61, 47), "bg2": (8, 28, 19), "accent": (241, 245, 249), "badge": "FRESH FARM CHEESE", "symbol": "🧀"},
    "Cultured Desi Butter (Makkhan)": {"bg1": (92, 71, 10), "bg2": (32, 23, 0), "accent": (254, 240, 138), "badge": "ARTISANAL BUTTER", "symbol": "🧈"},

    # Oilseeds
    "Saurashtra Groundnut Seeds (Moongphali)": {"bg1": (69, 43, 27), "bg2": (28, 15, 8), "accent": (217, 119, 6), "badge": "OILSEEDS & NUTS", "symbol": "🥜"},
    "Yellow Mustard Seeds (Sarson)": {"bg1": (92, 71, 0), "bg2": (34, 25, 0), "accent": (250, 204, 21), "badge": "COLD PRESS SEEDS", "symbol": "🌱"},
    "White Sesame Seeds (Desi Til)": {"bg1": (58, 57, 56), "bg2": (22, 21, 20), "accent": (226, 232, 240), "badge": "MINERAL RICH SEEDS", "symbol": "🌱"},
    "Malwa Yellow Soybean": {"bg1": (77, 63, 24), "bg2": (27, 21, 6), "accent": (245, 158, 11), "badge": "HIGH PROTEIN BEANS", "symbol": "🌱"},

    # Herbs
    "Fresh Holy Basil (Desi Tulsi)": {"bg1": (15, 61, 31), "bg2": (4, 26, 11), "accent": (34, 197, 94), "badge": "SACRED AYURVEDIC HERBS", "symbol": "🌿"},
    "Fresh Coriander Leaves (Kothmir)": {"bg1": (18, 66, 32), "bg2": (5, 28, 12), "accent": (74, 222, 128), "badge": "CULINARY FRESH HERBS", "symbol": "🌿"},
    "Fresh Garden Mint (Pudina)": {"bg1": (11, 64, 46), "bg2": (3, 28, 19), "accent": (52, 211, 153), "badge": "REFRESHING HERBS", "symbol": "🌱"},
    "Fresh Curry Leaves (Kadi Patta)": {"bg1": (11, 51, 24), "bg2": (3, 21, 8), "accent": (34, 197, 94), "badge": "AROMATIC HERBS", "symbol": "🍃"},
    "Organic Lemongrass Stalks": {"bg1": (32, 66, 24), "bg2": (10, 26, 6), "accent": (163, 230, 53), "badge": "CITRUS BOTANICALS", "symbol": "🌾"},
}


def _draw_gradient(img, color1, color2):
    """Draws a vertical gradient from color1 to color2."""
    width, height = img.size
    draw = ImageDraw.Draw(img)
    for y in range(height):
        ratio = y / float(height)
        r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
        g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
        b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))


def generate_single_product_image(product_name, output_path, is_organic=False):
    """Generates a professional 800x600 product card banner image."""
    width, height = 800, 600
    img = Image.new("RGB", (width, height), color=(20, 20, 20))
    
    style = CROP_STYLES.get(product_name, {
        "bg1": (27, 67, 50),
        "bg2": (8, 28, 21),
        "accent": (74, 222, 128),
        "badge": "FARM PRODUCE",
        "symbol": "🌱",
    })
    
    # 1. Base Gradient
    _draw_gradient(img, style["bg1"], style["bg2"])
    draw = ImageDraw.Draw(img, "RGBA")

    # 2. Subtle radial glow behind center
    glow_color = style["accent"] + (35,)
    for r in range(220, 60, -25):
        alpha = int(25 * (1 - r / 220.0))
        draw.ellipse([400 - r, 250 - r, 400 + r, 250 + r], fill=style["accent"] + (alpha,))

    # 3. Outer Frame & Inner Accent Border
    draw.rectangle([24, 24, width - 24, height - 24], outline=(255, 255, 255, 45), width=2)
    draw.rectangle([34, 34, width - 34, height - 34], outline=style["accent"] + (110,), width=1)
    
    # Corner Accents
    corner_len = 24
    accent_rgb = style["accent"]
    for cx, cy in [(30, 30), (width - 30, 30), (30, height - 30), (width - 30, height - 30)]:
        x_dir = 1 if cx < 400 else -1
        y_dir = 1 if cy < 300 else -1
        draw.line([(cx, cy), (cx + corner_len * x_dir, cy)], fill=accent_rgb, width=3)
        draw.line([(cx, cy), (cx, cy + corner_len * y_dir)], fill=accent_rgb, width=3)

    # 4. Top Category Pill Badge
    try:
        font_pill = ImageFont.truetype("arial.ttf", 15)
        font_title = ImageFont.truetype("arial.ttf", 34)
        font_sub = ImageFont.truetype("arial.ttf", 16)
        font_badge = ImageFont.truetype("arial.ttf", 14)
        font_emblem = ImageFont.truetype("segoeui.ttf", 75)
    except Exception:
        font_pill = ImageFont.load_default()
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_badge = ImageFont.load_default()
        font_emblem = ImageFont.load_default()

    badge_text = f"•  {style['badge']}  •"
    pill_bbox = draw.textbbox((0, 0), badge_text, font=font_pill)
    pill_w = pill_bbox[2] - pill_bbox[0] + 36
    pill_h = 32
    pill_x1 = int(400 - pill_w / 2)
    pill_y1 = 60
    draw.rounded_rectangle([pill_x1, pill_y1, pill_x1 + pill_w, pill_y1 + pill_h], radius=16, fill=(0, 0, 0, 110), outline=style["accent"] + (160,), width=1)
    draw.text((pill_x1 + 18, pill_y1 + 7), badge_text, fill=style["accent"], font=font_pill)

    # 5. Center Decorative Emblem Shield
    shield_r = 90
    draw.ellipse([400 - shield_r, 235 - shield_r, 400 + shield_r, 235 + shield_r], fill=(0, 0, 0, 95), outline=style["accent"] + (190,), width=3)
    draw.ellipse([400 - shield_r + 8, 235 - shield_r + 8, 400 + shield_r - 8, 235 + shield_r - 8], outline=(255, 255, 255, 60), width=1)

    # Center Botanical Emblem/Emoji
    symbol = style.get("symbol", "🌿")
    sym_bbox = draw.textbbox((0, 0), symbol, font=font_emblem)
    sym_w = sym_bbox[2] - sym_bbox[0]
    sym_h = sym_bbox[3] - sym_bbox[1]
    draw.text((400 - sym_w / 2, 230 - sym_h / 2), symbol, font=font_emblem, fill=(255, 255, 255, 255))

    # 6. Product Title (Wrapped if long)
    title_text = product_name
    # Handle long titles gracefully
    lines = []
    if len(title_text) > 28 and " (" in title_text:
        parts = title_text.split(" (")
        lines = [parts[0], f"({parts[1]}"]
    elif len(title_text) > 26 and " " in title_text:
        words = title_text.split(" ")
        mid = len(words) // 2
        lines = [" ".join(words[:mid]), " ".join(words[mid:])]
    else:
        lines = [title_text]

    start_y = 365 if len(lines) == 1 else 350
    for idx, line in enumerate(lines):
        line_bbox = draw.textbbox((0, 0), line, font=font_title)
        line_w = line_bbox[2] - line_bbox[0]
        # Text shadow
        draw.text((400 - line_w / 2 + 2, start_y + idx * 42 + 2), line, fill=(0, 0, 0, 180), font=font_title)
        draw.text((400 - line_w / 2, start_y + idx * 42), line, fill=(255, 255, 255, 245), font=font_title)

    # 7. Sub-caption
    sub_text = "FARMKET VERIFIED DIRECT ORIGIN"
    sub_bbox = draw.textbbox((0, 0), sub_text, font=font_sub)
    sub_w = sub_bbox[2] - sub_bbox[0]
    sub_y = start_y + len(lines) * 42 + 10
    draw.text((400 - sub_w / 2, sub_y), sub_text, fill=(200, 200, 200, 180), font=font_sub)

    # 8. Bottom Quality Seal Badge
    if is_organic:
        seal_text = "★  100% CERTIFIED ORGANIC  ★"
        seal_fill = (22, 101, 52, 220)
        seal_text_color = (187, 247, 208)
    else:
        seal_text = "★  100% FARM-TO-TABLE FRESH  ★"
        seal_fill = (30, 41, 59, 220)
        seal_text_color = style["accent"]

    seal_bbox = draw.textbbox((0, 0), seal_text, font=font_badge)
    seal_w = seal_bbox[2] - seal_bbox[0] + 36
    seal_h = 32
    seal_x = int(400 - seal_w / 2)
    seal_y = height - 85
    draw.rounded_rectangle([seal_x, seal_y, seal_x + seal_w, seal_y + seal_h], radius=8, fill=seal_fill, outline=style["accent"] + (170,), width=1)
    draw.text((seal_x + 18, seal_y + 8), seal_text, fill=seal_text_color, font=font_badge)

    # Save image
    output_dir = Path(output_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)
    img.save(output_path, "JPEG", quality=92, optimize=True)


def generate_all_catalog_images(media_products_dir, catalog):
    """
    Ensures images for all products in catalog are present.
    Preserves authentic downloaded photographs if already existing.
    """
    media_products_dir = Path(media_products_dir)
    media_products_dir.mkdir(parents=True, exist_ok=True)
    mapping = {}

    for prod in catalog:
        prod_name = prod["name"]
        filename = f"{slugify(prod_name)}.jpg"
        file_path = media_products_dir / filename

        # If an authentic photo already exists on disk, preserve it
        if not file_path.exists() or file_path.stat().st_size == 0:
            generate_single_product_image(
                product_name=prod_name,
                output_path=str(file_path),
                is_organic=prod.get("organic", False),
            )
        mapping[prod_name] = f"products/{filename}"

    return mapping

