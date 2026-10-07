"""
FounderAI Personalized Vector Logo Engine
=========================================
Generates programmatic, customizable, high-resolution vector SVG logos and brand assets
without external paid image generation APIs or Blender.

Features:
- 8 Distinct SVG Layout Templates:
    1. icon_wordmark (Icon + Wordmark side-by-side)
    2. minimal_wordmark (Sophisticated typography-first mark with accent geometries)
    3. monogram (Geometric crest with stylized brand initials)
    4. circular_emblem (Classic round seal with concentric rings and radial accents)
    5. badge (Heraldic / hexagonal / shield container with domain emblem)
    6. icon_above_text (Vertically centered icon stacked above bold lettering)
    7. geometric_mark_wordmark (Modern polygonal / abstract geometry + sans wordmark)
    8. modern_stacked (Two-tier typography with contrasting weights & accent block)
- Deep Category Icon System (vector shapes for tea, food, AI/cybersecurity, grocery, fitness, etc.)
- Smart initials and monogram calculation (handles multi-word, CamelCase, numbers)
- High-contrast color verification & SVG sanitization
- Server-side PNG and Favicon rendering via resvg-py
- Full FounderAI_Brand_Kit.zip packaging
"""

import re
import html
import io
import zipfile
import json
import logging
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger("founder_ai.logo_engine")

try:
    import resvg_py
    HAS_RESVG = True
except ImportError:
    HAS_RESVG = False
    logger.warning("resvg-py not installed. Server-side PNG rendering will use fallback.")

# ──────────────────────────────────────────────────────────────
# 1. Text Sanitization & Abbreviation Utilities
# ──────────────────────────────────────────────────────────────

def sanitize_svg_text(text: str, uppercase: bool = False) -> str:
    """
    Escapes XML special characters to produce strictly valid SVG XML text.
    Maintains lowercase XML entities (&amp;, &lt;, &gt;, &quot;, &apos;)
    even when uppercase rendering is desired.
    """
    if not text:
        return ""
    clean = re.sub(r'<[^>]*>', '', str(text)).strip()
    if uppercase:
        clean = clean.upper()
    escaped = html.escape(clean, quote=True)
    # Guarantee standard XML entities are always lowercase
    escaped = re.sub(r'&(AMP|LT|GT|QUOT|APOS);', lambda m: f"&{m.group(1).lower()};", escaped)
    return escaped

def extract_initials(brand_name: str) -> str:
    """
    Derives clean 1-3 letter initials for monograms and emblems.
    Handles CamelCase ("TeaVerse" -> "TV"), multi-word ("Nexora AI" -> "NA",
    "Green Basket" -> "GB", "Annapoorna Foods" -> "AF"), and single words.
    """
    if not brand_name:
        return "FA"
    
    clean = re.sub(r'[^a-zA-Z0-9\s]', '', brand_name).strip()
    words = clean.split()
    
    if len(words) >= 2:
        return "".join(w[0] for w in words[:3]).upper()
    
    # Check for CamelCase in single word, e.g., "TeaVerse", "FitForge", "GreenBasket"
    camel_parts = re.findall(r'[A-Z][a-z0-9]*', clean)
    if len(camel_parts) >= 2:
        return "".join(p[0] for p in camel_parts[:3]).upper()
    
    # Fallback to first two letters of single word
    if len(clean) >= 2:
        return clean[:2].upper()
    
    return clean.upper()

def split_brand_name(brand_name: str) -> Tuple[str, str]:
    """
    Splits brand name for two-tier stacked layouts.
    E.g. 'Nexora AI' -> ('NEXORA', 'AI'), 'GreenBasket' -> ('GREEN', 'BASKET')
    """
    clean = re.sub(r'[^a-zA-Z0-9\s]', '', brand_name).strip()
    words = clean.split()
    if len(words) >= 2:
        return words[0].upper(), " ".join(words[1:]).upper()
    
    # Split camel case if applicable
    camel_parts = re.findall(r'[A-Z][a-z0-9]*', clean)
    if len(camel_parts) >= 2:
        return camel_parts[0].upper(), "".join(camel_parts[1:]).upper()
        
    return clean.upper(), ""

# ──────────────────────────────────────────────────────────────
# 2. Color Normalization & Contrast
# ──────────────────────────────────────────────────────────────

DEFAULT_PALETTE = {
    "primary": "#6366F1",
    "secondary": "#38BDF8",
    "accent": "#F59E0B",
    "bg": "#070A14",
    "text": "#F8FAFC"
}

def is_valid_hex(hex_str: str) -> bool:
    if not hex_str or not isinstance(hex_str, str):
        return False
    return bool(re.match(r'^#(?:[0-9a-fA-F]{3}){1,2}$', hex_str.strip()))

def normalize_colors(colors_in: Optional[Dict[str, Any]] = None) -> Dict[str, str]:
    """Ensures primary, secondary, accent, bg, and text hex codes are valid and vibrant."""
    out = dict(DEFAULT_PALETTE)
    if not colors_in:
        return out
        
    for k in ["primary", "primary_color"]:
        if k in colors_in and is_valid_hex(colors_in[k]):
            out["primary"] = colors_in[k].strip()
    for k in ["secondary", "secondary_color"]:
        if k in colors_in and is_valid_hex(colors_in[k]):
            out["secondary"] = colors_in[k].strip()
    for k in ["accent", "accent_color"]:
        if k in colors_in and is_valid_hex(colors_in[k]):
            out["accent"] = colors_in[k].strip()
    for k in ["text", "text_color"]:
        if k in colors_in and is_valid_hex(colors_in[k]):
            out["text"] = colors_in[k].strip()
    for k in ["bg", "background_color", "bg_color"]:
        if k in colors_in and is_valid_hex(colors_in[k]):
            out["bg"] = colors_in[k].strip()
            
    return out

# ──────────────────────────────────────────────────────────────
# 3. Vector Category Icon Library
# ──────────────────────────────────────────────────────────────

def get_category_vector_icon(category_hint: str, primary: str, accent: str, icon_size: int = 120, initials: str = "") -> str:
    """
    Returns an SVG group (<g>...</g>) centered at (0, 0) with radius/bounds approximately [-60, 60].
    Precision handcrafted vector symbols with human designer aesthetics (golden ratio curves,
    clean negative space, fine architectural linework, and premium emblem marks).
    """
    c = (category_hint or "").lower()
    
    # 1. South Indian / Traditional Food / Heritage / Banana Leaf / Marutham / Annapoorna
    if any(k in c for k in ["marutham", "banana", "leaf", "south indian", "tamil", "traditional", "annapoorna", "curry", "dosa", "idli", "feast", "meals"]):
        return f"""
        <!-- Artisan Curated Botanical Leaf & Royal Temple Lotus -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <!-- Fluid organic banana / heritage leaf silhouette -->
          <path d="M-36,26 C-46,-12 -22,-44 32,-44 C38,-44 42,-40 38,-32 C26,12 -12,38 -36,26 Z" fill="url(#logoGrad)" />
          <!-- Harmonious inner vein with graceful golden-ratio arc -->
          <path d="M-32,24 C-10,4 12,-16 32,-42" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.9" fill="none" />
          <!-- Lateral rib accents with delicate elegance -->
          <path d="M-18,14 C-10,18 -4,16 6,10" stroke="#FFFFFF" stroke-width="1.8" opacity="0.65" fill="none" />
          <path d="M-8,3 C0,7 6,4 18,-2" stroke="#FFFFFF" stroke-width="1.8" opacity="0.65" fill="none" />
          <path d="M4,-9 C12,-5 18,-8 26,-15" stroke="#FFFFFF" stroke-width="1.8" opacity="0.65" fill="none" />
          <!-- Crown jewel accent / Golden Diya flame -->
          <path d="M28,-42 C34,-52 38,-48 34,-36 C31,-40 29,-41 28,-42 Z" fill="{accent}" />
          <circle cx="34" cy="-44" r="3.5" fill="{accent}" />
        </g>
        """

    # 2. Tea / Chai / Teahouse / Brew / TeaVerse
    if any(k in c for k in ["tea", "chai", "teaverse", "teahouse", "brew"]):
        return f"""
        <!-- Minimalist Ceramic Tea Bowl & Aromatic Sprout -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <!-- Artisanal handcrafted stoneware cup -->
          <path d="M-32,-6 C-32,26 32,26 32,-6 Z" fill="url(#logoGrad)" />
          <path d="M-34,-6 L34,-6" stroke="{accent}" stroke-width="3.5" />
          <!-- Steaming aroma spiral -->
          <path d="M-10,-14 C-10,-32 0,-34 0,-44" stroke="{accent}" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.85" />
          <path d="M10,-14 C10,-28 18,-30 18,-38" stroke="{accent}" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.6" />
          <!-- Delicate floating Camellia sinensis leaf -->
          <path d="M-12,-40 C-6,-54 10,-48 8,-36 C-2,-34 -8,-38 -12,-40 Z" fill="{accent}" />
          <!-- Saucer foundation bar -->
          <line x1="-38" y1="32" x2="38" y2="32" stroke="{accent}" stroke-width="3" />
        </g>
        """
        
    # 3. Coffee / Cafe / Espresso / Roast
    if any(k in c for k in ["coffee", "cafe", "espresso", "roast", "cappuccino", "barista"]):
        return f"""
        <!-- Modern Roastery Emblem & Interlocking Beans -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <ellipse cx="-10" cy="-6" rx="20" ry="28" fill="url(#logoGrad)" transform="rotate(-24 -10 -6)" />
          <path d="M-18,-28 Q-6,-6 -14,14" stroke="#070A14" stroke-width="3.5" fill="none" />
          <ellipse cx="12" cy="4" rx="16" ry="24" fill="{accent}" transform="rotate(32 12 4)" opacity="0.9" />
          <path d="M8,-12 Q18,6 10,22" stroke="#070A14" stroke-width="3" fill="none" />
          <circle cx="28" cy="-28" r="3.5" fill="{accent}" />
        </g>
        """

    # 4. AI / Cybersecurity / Software / Tech / Cloud / Nexora
    if any(k in c for k in ["cyber", "ai", "security", "nexora", "software", "tech", "saas", "network", "cloud"]):
        return f"""
        <!-- Precision Hexagonal Neural Apex Matrix -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <!-- Outer precision isometric hex seal -->
          <polygon points="0,-48 40,-24 40,24 0,48 -40,24 -40,-24" fill="none" stroke="url(#logoGrad)" stroke-width="5" />
          <!-- Inner geometric core cube -->
          <polygon points="0,-24 22,-11 0,2 -22,-11" fill="{accent}" opacity="0.9" />
          <polygon points="0,2 22,-11 22,14 0,27" fill="url(#logoGrad)" opacity="0.8" />
          <polygon points="0,2 -22,-11 -22,14 0,27" fill="url(#logoGrad)" opacity="0.5" />
          <!-- Neural interconnect laser nodes -->
          <circle cx="0" cy="-48" r="4.5" fill="{accent}" />
          <circle cx="40" cy="24" r="4.5" fill="{accent}" />
          <circle cx="-40" cy="24" r="4.5" fill="{accent}" />
        </g>
        """

    # 5. Organic Grocery / Retail / Green / Farming / Food Market
    if any(k in c for k in ["grocery", "basket", "greenbasket", "organic", "market", "farm", "produce", "fresh", "store"]):
        return f"""
        <!-- Minimalist Sprout Within Woven Arch -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <path d="M-36,24 C-36,-14 36,-14 36,24" fill="none" stroke="url(#logoGrad)" stroke-width="5" />
          <path d="M-26,24 L26,24" stroke="url(#logoGrad)" stroke-width="4" />
          <!-- Twin organic leaves -->
          <path d="M0,18 C-24,2 -24,-24 0,-34 C-2,-14 6,-4 0,18 Z" fill="url(#logoGrad)" />
          <path d="M0,18 C24,2 24,-24 0,-34 C2,-14 -6,-4 0,18 Z" fill="{accent}" opacity="0.9" />
          <circle cx="0" cy="-40" r="4" fill="{accent}" />
        </g>
        """

    # 6. Fitness / Gym / Workout / Athletics / Forge
    if any(k in c for k in ["fit", "forge", "fitness", "gym", "workout", "crossfit", "strength", "iron", "muscle"]):
        return f"""
        <!-- Geometric Spartan Wing & Anvil Power -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <polygon points="0,-46 36,-10 24,34 0,44 -24,34 -36,-10" fill="none" stroke="url(#logoGrad)" stroke-width="5" />
          <!-- Central dynamic lightning chevron -->
          <polygon points="4,-32 18,-6 2,-6 10,24 -14,-2 -2,-2" fill="{accent}" />
        </g>
        """

    # 7. Restaurant / Dining / Kitchen / Culinary / Biryani
    if any(k in c for k in ["restaurant", "dining", "kitchen", "biryani", "bhojan", "bhavan"]):
        return f"""
        <!-- Master Chef Cloche & Culinary Crown -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <path d="M-38,18 C-38,-14 38,-14 38,18 Z" fill="url(#logoGrad)" />
          <line x1="-44" y1="22" x2="44" y2="22" stroke="{accent}" stroke-width="4.5" stroke-linecap="round" />
          <circle cx="0" cy="-22" r="7" fill="{accent}" />
          <!-- Elegant Michelin 3-star accents -->
          <polygon points="0,-36 3,-30 9,-30 4,-26 6,-20 0,-24 -6,-20 -4,-26 -9,-30 -3,-30" fill="{accent}" />
        </g>
        """

    # 8. Finance / FinTech / Banking / Wealth / Invest
    if any(k in c for k in ["finance", "money", "invest", "wealth", "bank", "capital", "fund", "venture"]):
        return f"""
        <!-- Precision Geometric Diamond Vault & Dynamic Growth Peak -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <polygon points="0,-48 38,-14 0,44 -38,-14" fill="none" stroke="url(#logoGrad)" stroke-width="5" />
          <!-- Ascending vector trend lines -->
          <polyline points="-20,6 -6,-8 6,0 20,-20" stroke="{accent}" stroke-width="4.5" fill="none" />
          <polyline points="10,-20 20,-20 20,-10" stroke="{accent}" stroke-width="4.5" fill="none" />
        </g>
        """

    # 9. Real Estate / Architecture / Housing
    if any(k in c for k in ["real estate", "property", "house", "home", "building", "estate", "architecture"]):
        return f"""
        <!-- Bauhaus Minimalist Roofline & Modern Keystone -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <polygon points="0,-44 42,-4 32,-4 32,36 -32,36 -32,-4 -42,-4" fill="none" stroke="url(#logoGrad)" stroke-width="5" />
          <polygon points="0,-26 24,-2 0,22 -24,-2" fill="{accent}" opacity="0.85" />
          <rect x="-8" y="14" width="16" height="22" fill="url(#logoGrad)" />
        </g>
        """

    # 10. Pet Care / Animals / Dogs / Cats / Vet / Veterinary Clinic
    if any(k in c for k in ["pet", "dog", "cat", "animal", "vet", "veterinary", "grooming", "paw", "puppy", "kitten", "canine", "feline"]):
        return f"""
        <!-- Elegant Minimalist Paw & Hearth -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <ellipse cx="0" cy="12" rx="20" ry="16" fill="url(#logoGrad)" />
          <circle cx="-22" cy="-12" r="8" fill="{accent}" />
          <circle cx="-8" cy="-24" r="8.5" fill="{accent}" />
          <circle cx="8" cy="-24" r="8.5" fill="{accent}" />
          <circle cx="22" cy="-12" r="8" fill="{accent}" />
        </g>
        """

    # 11. Healthcare / Medical / Pharmacy / Human Clinic
    if any(k in c for k in ["health", "medical", "clinic", "pharma", "care", "wellness", "doctor"]) and not any(k in c for k in ["pet", "dog", "cat", "animal", "vet", "paw"]):
        return f"""
        <!-- Modern Swiss Cross & Harmonious Healing Circle -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <circle cx="0" cy="0" r="42" fill="none" stroke="{accent}" stroke-width="3" stroke-dasharray="6,4" />
          <path d="M-10,-32 L10,-32 L10,-10 L32,-10 L32,10 L10,10 L10,32 L-10,32 L-10,10 L-32,10 L-32,-10 L-10,-10 Z" fill="url(#logoGrad)" />
          <circle cx="0" cy="0" r="6" fill="#070A14" />
        </g>
        """

    # 12. Education / Learning / EdTech / Academy
    if any(k in c for k in ["edu", "learn", "academy", "school", "institute", "study", "code"]):
        return f"""
        <!-- Open Tome & Geometric Torch of Knowledge -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <path d="M-36,18 C-18,8 0,16 0,22 C0,16 18,8 36,18 L36,-16 C18,-24 0,-18 0,-12 C0,-18 -18,-24 -36,-16 Z" fill="url(#logoGrad)" />
          <line x1="0" y1="-12" x2="0" y2="24" stroke="{accent}" stroke-width="3.5" />
          <circle cx="0" cy="-30" r="7" fill="{accent}" />
        </g>
        """

    # 13. Automotive / Detailing / Transport / Mobility
    if any(k in c for k in ["auto", "car", "motor", "vehicle", "mobility", "drive", "transport", "logistics"]):
        return f"""
        <!-- Sleek Aerodynamic Apex Silhouette -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <path d="M-42,12 C-28,-8 14,-14 42,4 L36,14 L-38,14 Z" fill="url(#logoGrad)" />
          <circle cx="-18" cy="18" r="9" fill="#070A14" stroke="{accent}" stroke-width="4" />
          <circle cx="22" cy="18" r="9" fill="#070A14" stroke="{accent}" stroke-width="4" />
          <line x1="-42" y1="28" x2="42" y2="28" stroke="{accent}" stroke-width="3" />
        </g>
        """

    # 14. Fashion / Clothing / Apparel / Boutique / Textile
    if any(k in c for k in ["fashion", "cloth", "apparel", "boutique", "textile", "saree", "silk", "wear", "garment", "style"]):
        return f"""
        <!-- Haute Couture Hanger & Diamond Crest -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <path d="M0,-36 C6,-36 10,-32 8,-26 C6,-20 0,-18 0,-12" fill="none" stroke="{accent}" stroke-width="4" />
          <polygon points="0,-10 42,16 -42,16" fill="none" stroke="url(#logoGrad)" stroke-width="4.5" />
          <line x1="-38" y1="22" x2="38" y2="22" stroke="{accent}" stroke-width="3" />
          <circle cx="0" cy="6" r="4.5" fill="{accent}" />
        </g>
        """

    # 15. Salon / Beauty / Spa / Hair / Cosmetics
    if any(k in c for k in ["salon", "beauty", "spa", "hair", "cosmetic", "parlour", "facial", "barber"]):
        return f"""
        <!-- Stylized Lotus Blossom & Shears of Grace -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <path d="M0,28 C-28,10 -28,-22 0,-38 C28,-22 28,10 0,28 Z" fill="none" stroke="url(#logoGrad)" stroke-width="4" />
          <path d="M0,22 C-14,6 -14,-14 0,-26 C14,-14 14,6 0,22 Z" fill="{accent}" opacity="0.85" />
          <circle cx="0" cy="-42" r="4" fill="{accent}" />
        </g>
        """

    # 16. Laundry / Dry Clean / Cleaning / Housekeeping
    if any(k in c for k in ["laundry", "clean", "wash", "dry clean", "iron"]):
        return f"""
        <!-- Pure Water Sparkle & Fresh Fold -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <path d="M0,-42 C20,-16 26,4 18,22 C10,38 -10,38 -18,22 C-26,4 -20,-16 0,-42 Z" fill="url(#logoGrad)" />
          <path d="M-6,2 C-2,14 6,18 10,8" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round" />
          <circle cx="24" cy="-18" r="5" fill="{accent}" />
          <circle cx="-22" cy="10" r="3.5" fill="{accent}" />
        </g>
        """

    # 17. Bakery / Cake / Sweets / Pastry
    if any(k in c for k in ["bakery", "cake", "sweet", "pastry", "bread", "dessert"]):
        return f"""
        <!-- Artisan Wheat Sheaf & Confection Crown -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <path d="M-30,22 C-30,-10 30,-10 30,22 Z" fill="url(#logoGrad)" />
          <line x1="-36" y1="26" x2="36" y2="26" stroke="{accent}" stroke-width="4" />
          <path d="M-14,-14 C-14,-32 0,-34 0,-44" stroke="{accent}" stroke-width="3" fill="none" opacity="0.8" />
          <path d="M14,-14 C14,-28 6,-30 6,-38" stroke="{accent}" stroke-width="2.5" fill="none" opacity="0.6" />
          <circle cx="0" cy="-16" r="5" fill="{accent}" />
        </g>
        """

    # 18. Agriculture / Farming / Hydroponics / Botanical / Plants / Greenery
    if any(k in c for k in ["agri", "farm", "hydroponic", "plant", "botanical", "crop", "seed", "flora", "greenhouse"]):
        return f"""
        <!-- Organic Sprout & Geometric Hexagonal Terrarium -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <polygon points="0,-44 38,-22 38,22 0,44 -38,22 -38,-22" fill="none" stroke="url(#logoGrad)" stroke-width="4" />
          <path d="M0,22 C-18,6 -20,-16 0,-28 C20,-16 18,6 0,22 Z" fill="{accent}" opacity="0.9" />
          <path d="M0,22 L0,-24" stroke="#FFFFFF" stroke-width="2.5" />
          <circle cx="0" cy="-34" r="4.5" fill="{accent}" />
        </g>
        """

    # 19. Drone / Aerospace / Robotics / Aviation / Hardware / Aerial
    if any(k in c for k in ["drone", "aerospace", "robot", "robotics", "aviation", "flight", "aerial", "hardware", "uav", "sensor"]):
        return f"""
        <!-- Quad-Rotor Apex Vortex & Precision Sensor Node -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <circle cx="0" cy="0" r="18" fill="url(#logoGrad)" />
          <circle cx="0" cy="0" r="8" fill="{accent}" />
          <!-- Aerodynamic Propeller Arms -->
          <line x1="-32" y1="-32" x2="32" y2="32" stroke="url(#logoGrad)" stroke-width="4.5" stroke-linecap="round" />
          <line x1="-32" y1="32" x2="32" y2="-32" stroke="url(#logoGrad)" stroke-width="4.5" stroke-linecap="round" />
          <!-- Precision Rotor Rings -->
          <circle cx="-32" cy="-32" r="9" fill="none" stroke="{accent}" stroke-width="2.5" />
          <circle cx="32" cy="32" r="9" fill="none" stroke="{accent}" stroke-width="2.5" />
          <circle cx="-32" cy="32" r="9" fill="none" stroke="{accent}" stroke-width="2.5" />
          <circle cx="32" cy="-32" r="9" fill="none" stroke="{accent}" stroke-width="2.5" />
        </g>
        """

    # 20. Clean Energy / Solar / Battery / Electric / Renewable / Wind
    if any(k in c for k in ["solar", "energy", "clean", "battery", "electric", "power", "renewable", "wind", "eco"]):
        return f"""
        <!-- Solar Radiant Iris & Dynamic Kinetic Spark -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <circle cx="0" cy="0" r="28" fill="none" stroke="url(#logoGrad)" stroke-width="4" />
          <polygon points="0,-44 8,-28 -8,-28" fill="{accent}" />
          <polygon points="0,44 8,28 -8,28" fill="{accent}" />
          <polygon points="-44,0 -28,-8 -28,8" fill="{accent}" />
          <polygon points="44,0 28,-8 28,8" fill="{accent}" />
          <!-- Central Energy Bolt -->
          <polygon points="3,-18 -10,0 2,0 -3,18 10,0 -2,0" fill="{accent}" />
        </g>
        """

    # 21. Music / Audio / Sound / Media / Entertainment / Podcasting
    if any(k in c for k in ["music", "audio", "sound", "podcast", "media", "entertainment", "acoustic", "studio", "radio"]):
        return f"""
        <!-- Dynamic Soundwave Frequency & Harmonious Lyre -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <line x1="-32" y1="0" x2="-32" y2="0" stroke="url(#logoGrad)" stroke-width="5" stroke-linecap="round" />
          <line x1="-20" y1="-20" x2="-20" y2="20" stroke="url(#logoGrad)" stroke-width="5" stroke-linecap="round" />
          <line x1="-8" y1="-34" x2="-8" y2="34" stroke="{accent}" stroke-width="5" stroke-linecap="round" />
          <line x1="4" y1="-44" x2="4" y2="44" stroke="url(#logoGrad)" stroke-width="5.5" stroke-linecap="round" />
          <line x1="16" y1="-28" x2="16" y2="28" stroke="{accent}" stroke-width="5" stroke-linecap="round" />
          <line x1="28" y1="-14" x2="28" y2="14" stroke="url(#logoGrad)" stroke-width="5" stroke-linecap="round" />
          <circle cx="4" cy="-48" r="3.5" fill="{accent}" />
        </g>
        """

    # 22. Gaming / Esports / Interactive / Arcade / Virtual
    if any(k in c for k in ["game", "gaming", "esport", "arcade", "interactive", "virtual", "vr"]):
        return f"""
        <!-- Geometric Game Controller Shield & Precision D-Pad -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <path d="M-38,-14 C-44,14 -24,38 -12,28 L-4,18 L4,18 L12,28 C24,38 44,14 38,-14 C36,-26 22,-28 14,-22 L-14,-22 C-22,-28 -36,-26 -38,-14 Z" fill="url(#logoGrad)" />
          <circle cx="22" cy="-4" r="4.5" fill="{accent}" />
          <circle cx="14" cy="4" r="4" fill="{accent}" opacity="0.8" />
          <rect x="-24" y="-8" width="10" height="4" fill="#070A14" />
          <rect x="-21" y="-11" width="4" height="10" fill="#070A14" />
        </g>
        """

    # 23. Construction / Engineering / Architecture / Industrial
    if any(k in c for k in ["construct", "engineer", "industrial", "build", "steel", "cement", "infra"]):
        return f"""
        <!-- Structural Keystone & Engineered Truss Apex -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <polygon points="0,-46 42,28 -42,28" fill="none" stroke="url(#logoGrad)" stroke-width="5" />
          <line x1="0" y1="-46" x2="0" y2="28" stroke="{accent}" stroke-width="3" />
          <line x1="-24" y1="4" x2="24" y2="4" stroke="{accent}" stroke-width="3.5" />
          <circle cx="0" cy="-14" r="6" fill="{accent}" />
        </g>
        """

    # 24. Photography / Film / Camera / Visual / Video
    if any(k in c for k in ["photo", "camera", "film", "visual", "video", "cinema", "lens"]):
        return f"""
        <!-- Precision Optical Aperture & Gold Prism Eye -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <circle cx="0" cy="0" r="38" fill="none" stroke="url(#logoGrad)" stroke-width="4.5" />
          <polygon points="0,-36 24,-14 14,24 -14,24 -24,-14" fill="none" stroke="{accent}" stroke-width="2.5" />
          <circle cx="0" cy="0" r="14" fill="url(#logoGrad)" />
          <circle cx="0" cy="0" r="6" fill="{accent}" />
        </g>
        """

    # 25. Pottery / Ceramics / Crafts / Handmade / Artisan
    if any(k in c for k in ["pottery", "ceramic", "craft", "handmade", "artisan", "clay", "woodwork"]):
        return f"""
        <!-- Handcrafted Amphora & Master Sculptor Arc -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <path d="M-18,-36 L18,-36 C14,-18 32,-4 24,18 C18,34 -18,34 -24,18 C-32,-4 -14,-18 -18,-36 Z" fill="url(#logoGrad)" />
          <line x1="-22" y1="-36" x2="22" y2="-36" stroke="{accent}" stroke-width="4" />
          <ellipse cx="0" cy="8" rx="14" ry="6" fill="none" stroke="{accent}" stroke-width="2.5" />
          <line x1="-14" y1="38" x2="14" y2="38" stroke="{accent}" stroke-width="3.5" />
        </g>
        """

    # 26. Jewelry / Luxury / Gems / Diamond / Watches
    if any(k in c for k in ["jewel", "luxury", "diamond", "gem", "gold", "silver", "watch"]):
        return f"""
        <!-- Brilliant Faceted Diamond Crest & Crown Sparkle -->
        <g stroke-linecap="round" stroke-linejoin="round">
          <polygon points="-24,-24 0,-44 24,-24 38,-4 0,38 -38,-4" fill="none" stroke="url(#logoGrad)" stroke-width="4" />
          <polyline points="-38,-4 -14,-4 0,38 14,-4 38,-4" stroke="{accent}" stroke-width="2.5" fill="none" />
          <polyline points="-24,-24 -14,-4 0,-44 14,-4 24,-24" stroke="{accent}" stroke-width="2" fill="none" />
          <circle cx="0" cy="-4" r="4.5" fill="{accent}" />
        </g>
        """

    # 27. Universal Bespoke Monogram / Architectural Shield Fallback:
    # Instead of an ambiguous 4-point star that looks like a "+", render an
    # executive architectural monogram emblem displaying the startup's actual initials!
    clean_inits = re.sub(r'[^a-zA-Z0-9]', '', initials).strip().upper()[:3]
    if not clean_inits:
        words = [w for w in re.sub(r'[^a-zA-Z0-9\s]', '', c).split() if len(w) > 1 and w not in ["the", "and", "for", "with", "startup", "company", "shop", "store"]]
        clean_inits = (words[0][0] + (words[1][0] if len(words) > 1 else "")) if words else "FA"
    init_safe = clean_inits if clean_inits else "FA"

    font_size = 28 if len(init_safe) == 1 else (23 if len(init_safe) == 2 else 17)

    return f"""
    <!-- Bespoke Architectural Monogram Seal of Provenance -->
    <g stroke-linecap="round" stroke-linejoin="round">
      <!-- Outer Precision Octagonal Geometry Shield -->
      <polygon points="0,-48 34,-34 48,0 34,34 0,48 -34,34 -48,0 -34,-34" fill="none" stroke="url(#logoGrad)" stroke-width="3" />
      <!-- Inner Concentric Precision Crest Ring -->
      <circle cx="0" cy="0" r="38" fill="none" stroke="{accent}" stroke-width="1.2" stroke-dasharray="3,3" opacity="0.85" />
      <!-- Architectural Cardinal Diamond Accents -->
      <polygon points="0,-48 3.5,-42 -3.5,-42" fill="{accent}" />
      <polygon points="0,48 3.5,42 -3.5,42" fill="{accent}" />
      <polygon points="-48,0 -42,-3.5 -42,3.5" fill="{accent}" />
      <polygon points="48,0 42,-3.5 42,3.5" fill="{accent}" />
      <!-- Subtle Architectural Baseline Pedestals -->
      <line x1="-24" y1="16" x2="-8" y2="16" stroke="{accent}" stroke-width="1.5" opacity="0.7" />
      <circle cx="0" cy="16" r="2" fill="{accent}" opacity="0.9" />
      <line x1="8" y1="16" x2="24" y2="16" stroke="{accent}" stroke-width="1.5" opacity="0.7" />
      <!-- Custom Monogram Lettermark -->
      <text x="0" y="7" font-family="'Outfit', 'Cinzel', 'Playfair Display', sans-serif" font-weight="900" font-size="{font_size}" fill="url(#logoGrad)" text-anchor="middle" letter-spacing="2.5">{init_safe}</text>
    </g>
    """

# ──────────────────────────────────────────────────────────────
# 4. Eight (8) Reusable SVG Layout Templates
# ──────────────────────────────────────────────────────────────

def template_icon_wordmark(brand: str, tag: str, cat: str, c: Dict[str, str], initials: str) -> str:
    """1. ICON + WORDMARK (Refined Horizontal Human-Designed Corporate Identity)"""
    b_safe = sanitize_svg_text(brand, uppercase=True)
    t_safe = sanitize_svg_text(tag, uppercase=True)
    icon_g = get_category_vector_icon(cat, c["primary"], c["accent"], initials=initials)
    
    font_size = 28 if len(b_safe) <= 12 else (22 if len(b_safe) <= 18 else 18)
    
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{c['primary']}" />
      <stop offset="100%" stop-color="{c['secondary']}" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="{c['accent']}" />
      <stop offset="100%" stop-color="{c['secondary']}" />
    </linearGradient>
  </defs>
  <!-- Architectural Canvas Foundation -->
  <rect width="100%" height="100%" fill="{c['bg']}" rx="24"/>
  
  <!-- Subtle Designer Framing Perimeter -->
  <rect x="22" y="22" width="456" height="456" rx="16" fill="none" stroke="{c['primary']}" stroke-width="1" stroke-opacity="0.18"/>
  <circle cx="22" cy="22" r="3" fill="{c['accent']}" opacity="0.5"/>
  <circle cx="478" cy="22" r="3" fill="{c['accent']}" opacity="0.5"/>
  <circle cx="22" cy="478" r="3" fill="{c['accent']}" opacity="0.5"/>
  <circle cx="478" cy="478" r="3" fill="{c['accent']}" opacity="0.5"/>

  <!-- Left: Emblem Pillar -->
  <g transform="translate(138, 250)">
    <!-- Soft luminous backing disc -->
    <circle cx="0" cy="0" r="68" fill="#0C1322" stroke="url(#logoGrad)" stroke-width="2.5" />
    <circle cx="0" cy="0" r="58" fill="none" stroke="{c['accent']}" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="4,4" />
    {icon_g}
  </g>
  
  <!-- Right: Editorial Typographic Block -->
  <g transform="translate(232, 236)">
    <!-- Brand Title -->
    <text x="0" y="10" font-family="'Outfit', 'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="{font_size}" fill="{c['text']}" letter-spacing="3.5">{b_safe}</text>
    <!-- Geometric Anchor Line -->
    <line x1="0" y1="26" x2="216" y2="26" stroke="url(#goldGrad)" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="216" cy="26" r="3" fill="{c['accent']}"/>
    <!-- Precision Tagline -->
    <text x="0" y="48" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="10.5" fill="{c['accent']}" letter-spacing="4.5">{t_safe}</text>
  </g>
</svg>"""

def template_minimal_wordmark(brand: str, tag: str, cat: str, c: Dict[str, str], initials: str) -> str:
    """2. MINIMAL WORDMARK (High-Fashion Haute Horlogerie Typographic Elegance)"""
    b_safe = sanitize_svg_text(brand, uppercase=True)
    t_safe = sanitize_svg_text(tag, uppercase=True)
    icon_g = get_category_vector_icon(cat, c["primary"], c["accent"], initials=initials)
    
    font_size = 34 if len(b_safe) <= 10 else (26 if len(b_safe) <= 16 else 20)
    
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="{c['primary']}" />
      <stop offset="50%" stop-color="{c['accent']}" />
      <stop offset="100%" stop-color="{c['secondary']}" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="{c['bg']}" rx="24"/>
  
  <!-- Architectural Fine Linework -->
  <line x1="90" y1="120" x2="410" y2="120" stroke="{c['primary']}" stroke-width="1" stroke-opacity="0.25"/>
  <circle cx="250" cy="120" r="4" fill="{c['accent']}"/>
  
  <!-- Petite Heritage Icon Accent at Top -->
  <g transform="translate(250, 185) scale(0.65)">
    {icon_g}
  </g>
  
  <!-- Center Wordmark -->
  <g transform="translate(250, 290)">
    <text x="0" y="0" font-family="'Cinzel', 'Outfit', serif" font-weight="800" font-size="{font_size}" fill="{c['text']}" text-anchor="middle" letter-spacing="7">{b_safe}</text>
    <line x1="-70" y1="24" x2="70" y2="24" stroke="url(#logoGrad)" stroke-width="2" stroke-linecap="round"/>
    <text x="0" y="52" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="11" fill="{c['accent']}" text-anchor="middle" letter-spacing="5">✦ {t_safe} ✦</text>
  </g>
  
  <!-- Baseline Architectural Balance -->
  <line x1="90" y1="385" x2="410" y2="385" stroke="{c['primary']}" stroke-width="1" stroke-opacity="0.25"/>
  <circle cx="250" cy="385" r="4" fill="{c['accent']}"/>
</svg>"""

def template_monogram(brand: str, tag: str, cat: str, c: Dict[str, str], initials: str) -> str:
    """3. MONOGRAM (Artisan Interlocking Monogram Seal & Luxury Crest)"""
    b_safe = sanitize_svg_text(brand, uppercase=True)
    t_safe = sanitize_svg_text(tag, uppercase=True)
    init_safe = sanitize_svg_text(initials[:3], uppercase=True)
    
    font_size_init = 62 if len(init_safe) <= 2 else 44
    
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{c['primary']}" />
      <stop offset="100%" stop-color="{c['accent']}" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="{c['bg']}" rx="24"/>
  
  <!-- Monogram Crest Enclosure -->
  <g transform="translate(250, 195)">
    <!-- Layered Octagonal / Shield Geometries -->
    <polygon points="0,-102 72,-72 102,0 72,72 0,102 -72,72 -102,0 -72,-72" fill="#0A0E1A" stroke="url(#logoGrad)" stroke-width="3" />
    <polygon points="0,-88 62,-62 88,0 62,62 0,88 -62,62 -88,0 -62,-62" fill="none" stroke="{c['accent']}" stroke-width="1" stroke-opacity="0.45" stroke-dasharray="5,4" />
    <!-- Center Artisan Typography -->
    <text x="0" y="22" font-family="'Cinzel', 'Outfit', serif" font-weight="900" font-size="{font_size_init}" fill="url(#logoGrad)" text-anchor="middle" letter-spacing="4">{init_safe}</text>
  </g>
  
  <!-- Wordmark Below Crest -->
  <g transform="translate(250, 365)">
    <text x="0" y="0" font-family="'Outfit', 'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="22" fill="{c['text']}" text-anchor="middle" letter-spacing="4.5">{b_safe}</text>
    <line x1="-50" y1="16" x2="50" y2="16" stroke="url(#logoGrad)" stroke-width="2" stroke-linecap="round"/>
    <text x="0" y="40" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="10.5" fill="{c['accent']}" text-anchor="middle" letter-spacing="3.5">{t_safe}</text>
  </g>
</svg>"""

def template_circular_emblem(brand: str, tag: str, cat: str, c: Dict[str, str], initials: str) -> str:
    """4. CIRCULAR EMBLEM (Royal Heritage Guild Seal with Curved Typography)"""
    b_safe = sanitize_svg_text(brand, uppercase=True)
    t_safe = sanitize_svg_text(tag, uppercase=True)
    icon_g = get_category_vector_icon(cat, c["primary"], c["accent"], initials=initials)
    
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{c['primary']}" />
      <stop offset="100%" stop-color="{c['accent']}" />
    </linearGradient>
    <path id="circlePathTop" d="M 75,250 A 175,175 0 1,1 425,250" fill="none" />
    <path id="circlePathBottom" d="M 425,250 A 175,175 0 0,1 75,250" fill="none" />
  </defs>
  <rect width="100%" height="100%" fill="{c['bg']}" rx="24"/>
  
  <!-- Concentric Guild Rings -->
  <circle cx="250" cy="250" r="218" fill="#090E1B" stroke="url(#logoGrad)" stroke-width="3"/>
  <circle cx="250" cy="250" r="198" fill="none" stroke="{c['accent']}" stroke-width="1.2" stroke-opacity="0.5" stroke-dasharray="6,4"/>
  <circle cx="250" cy="250" r="132" fill="#0E1628" stroke="url(#logoGrad)" stroke-width="2"/>
  <circle cx="250" cy="250" r="124" fill="none" stroke="{c['accent']}" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="3,3"/>
  
  <!-- Central Handcrafted Vector Symbol -->
  <g transform="translate(250, 250)">
    {icon_g}
  </g>
  
  <!-- Classical Radial Curved Typography -->
  <text font-family="'Outfit', 'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="17" fill="{c['text']}" letter-spacing="4.5">
    <textPath href="#circlePathTop" startOffset="50%" text-anchor="middle">{b_safe}</textPath>
  </text>
  <text font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="11" fill="{c['accent']}" letter-spacing="4">
    <textPath href="#circlePathBottom" startOffset="50%" text-anchor="middle">★ {t_safe} ★</textPath>
  </text>
</svg>"""

def template_badge(brand: str, tag: str, cat: str, c: Dict[str, str], initials: str) -> str:
    """5. BADGE (Heraldic Shield of Provenance & Bespoke Brand Mark)"""
    b_safe = sanitize_svg_text(brand, uppercase=True)
    t_safe = sanitize_svg_text(tag, uppercase=True)
    icon_g = get_category_vector_icon(cat, c["primary"], c["accent"], initials=initials)
    
    font_size = 20 if len(b_safe) <= 14 else 16
    
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{c['primary']}" />
      <stop offset="100%" stop-color="{c['secondary']}" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="{c['bg']}" rx="24"/>
  
  <!-- Precision Heraldic Crest -->
  <g transform="translate(250, 205)">
    <path d="M0,-130 L115,-78 L115,44 C115,110 0,152 0,152 C0,152 -115,110 -115,44 L-115,-78 Z" fill="#0A0E1A" stroke="url(#logoGrad)" stroke-width="4" stroke-linejoin="round" />
    <path d="M0,-116 L98,-70 L98,38 C98,96 0,134 0,134 C0,134 -98,96 -98,38 L-98,-70 Z" fill="none" stroke="{c['accent']}" stroke-width="1.2" stroke-opacity="0.45" stroke-dasharray="5,4" />
    
    <!-- Central Icon Stage -->
    <g transform="translate(0, -6)">
      {icon_g}
    </g>
  </g>
  
  <!-- Lower Architectural Banner -->
  <rect x="80" y="375" width="340" height="44" rx="10" fill="url(#logoGrad)"/>
  <text x="250" y="404" font-family="'Outfit', 'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="{font_size}" fill="#070A14" text-anchor="middle" letter-spacing="3.5">{b_safe}</text>
  <text x="250" y="444" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="10.5" fill="{c['accent']}" text-anchor="middle" letter-spacing="4">{t_safe}</text>
</svg>"""

def template_icon_above_text(brand: str, tag: str, cat: str, c: Dict[str, str], initials: str) -> str:
    """6. ICON ABOVE TEXT (Vertically Centered High-Status Emblem Stack)"""
    b_safe = sanitize_svg_text(brand, uppercase=True)
    t_safe = sanitize_svg_text(tag, uppercase=True)
    icon_g = get_category_vector_icon(cat, c["primary"], c["accent"], initials=initials)
    
    font_size = 28 if len(b_safe) <= 12 else (22 if len(b_safe) <= 18 else 18)
    
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{c['primary']}" />
      <stop offset="100%" stop-color="{c['accent']}" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="{c['bg']}" rx="24"/>
  
  <!-- Central Halo Chamber -->
  <g transform="translate(250, 185)">
    <circle cx="0" cy="0" r="92" fill="#0C1224" stroke="url(#logoGrad)" stroke-width="2.5" />
    <circle cx="0" cy="0" r="80" fill="none" stroke="{c['secondary']}" stroke-width="1" stroke-opacity="0.35" stroke-dasharray="4,4" />
    {icon_g}
  </g>
  
  <!-- Stacked Lettering -->
  <g transform="translate(250, 355)">
    <text x="0" y="0" font-family="'Outfit', 'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="{font_size}" fill="{c['text']}" text-anchor="middle" letter-spacing="3.5">{b_safe}</text>
    <line x1="-50" y1="20" x2="50" y2="20" stroke="url(#logoGrad)" stroke-width="2" stroke-linecap="round"/>
    <text x="0" y="46" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="11" fill="{c['accent']}" text-anchor="middle" letter-spacing="4">{t_safe}</text>
  </g>
</svg>"""

def template_geometric_mark_wordmark(brand: str, tag: str, cat: str, c: Dict[str, str], initials: str) -> str:
    """7. GEOMETRIC MARK + WORDMARK (Avant-Garde Architectural Polygonal Balance)"""
    b_safe = sanitize_svg_text(brand, uppercase=True)
    t_safe = sanitize_svg_text(tag, uppercase=True)
    
    font_size = 28 if len(b_safe) <= 12 else (22 if len(b_safe) <= 18 else 18)
    
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{c['primary']}" />
      <stop offset="100%" stop-color="{c['secondary']}" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="{c['bg']}" rx="24"/>
  
  <!-- Precision Interlocking Isometric Prism -->
  <g transform="translate(138, 250)">
    <polygon points="0,-56 48,-28 48,28 0,56 -48,28 -48,-28" fill="none" stroke="url(#logoGrad)" stroke-width="3" stroke-linejoin="round"/>
    <polygon points="0,-56 48,-28 0,0 -48,-28" fill="{c['primary']}" opacity="0.85"/>
    <polygon points="48,-28 48,28 0,56 0,0" fill="{c['secondary']}" opacity="0.65"/>
    <polygon points="-48,-28 0,0 0,56 -48,28" fill="{c['accent']}" opacity="0.75"/>
    <circle cx="0" cy="0" r="7" fill="#FFFFFF"/>
  </g>
  
  <!-- Refined Wordmark Stage -->
  <g transform="translate(235, 236)">
    <text x="0" y="10" font-family="'Outfit', 'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="{font_size}" fill="{c['text']}" letter-spacing="3.5">{b_safe}</text>
    <line x1="0" y1="26" x2="216" y2="26" stroke="url(#logoGrad)" stroke-width="2" stroke-linecap="round"/>
    <text x="0" y="48" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="11" fill="{c['accent']}" letter-spacing="4">{t_safe}</text>
  </g>
</svg>"""

def template_modern_stacked(brand: str, tag: str, cat: str, c: Dict[str, str], initials: str) -> str:
    """8. MODERN STACKED (Editorial Split-Weight High Fashion Typography)"""
    part1, part2 = split_brand_name(brand)
    t_safe = sanitize_svg_text(tag, uppercase=True)
    icon_g = get_category_vector_icon(cat, c["primary"], c["accent"], initials=initials)
    
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{c['primary']}" />
      <stop offset="100%" stop-color="{c['accent']}" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="{c['bg']}" rx="24"/>
  
  <!-- Left Column: Architectonic Emblem Tile -->
  <g transform="translate(130, 250)">
    <rect x="-60" y="-60" width="120" height="120" rx="20" fill="#0C1224" stroke="url(#logoGrad)" stroke-width="2.5"/>
    {icon_g}
  </g>
  
  <!-- Right Column: Editorial Contrasting Typography -->
  <g transform="translate(225, 218)">
    <text x="0" y="10" font-family="'Outfit', 'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="30" fill="{c['text']}" letter-spacing="3">{sanitize_svg_text(part1, uppercase=True)}</text>
    <text x="0" y="46" font-family="'Plus Jakarta Sans', sans-serif" font-weight="300" font-size="24" fill="{c['accent']}" letter-spacing="4.5">{sanitize_svg_text(part2 or 'STUDIO', uppercase=True)}</text>
    <line x1="0" y1="62" x2="190" y2="62" stroke="url(#logoGrad)" stroke-width="2" stroke-linecap="round"/>
    <text x="0" y="84" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="10" fill="{c['secondary']}" letter-spacing="3.5">{t_safe}</text>
  </g>
</svg>"""

LAYOUT_REGISTRY = {
    "icon_wordmark": {
        "name": "Modern Icon + Wordmark",
        "description": "Horizontal balanced identity combining a category vector emblem with refined typography.",
        "renderer": template_icon_wordmark
    },
    "minimal_wordmark": {
        "name": "Minimalist Typographic Wordmark",
        "description": "High-fashion typographic elegance with structural geometry and subtle accent rules.",
        "renderer": template_minimal_wordmark
    },
    "monogram": {
        "name": "Geometric Initials Monogram",
        "description": "Bold initials crest enclosed inside an engineered hexagonal seal for high scalability.",
        "renderer": template_monogram
    },
    "circular_emblem": {
        "name": "Heritage Circular Emblem",
        "description": "Prestigious circular seal with concentric rings, curved typography, and central crest.",
        "renderer": template_circular_emblem
    },
    "badge": {
        "name": "Heraldic Shield Badge",
        "description": "Authoritative heraldic container with stylized domain emblem and name ribbon.",
        "renderer": template_badge
    },
    "icon_above_text": {
        "name": "Centered Emblem Stack",
        "description": "Vertically centered emblem resting gracefully above bold, high-contrast lettering.",
        "renderer": template_icon_above_text
    },
    "geometric_mark_wordmark": {
        "name": "Isometric Geometric Mark",
        "description": "Modern multi-dimensional polygonal mark paired with clean sans-serif typography.",
        "renderer": template_geometric_mark_wordmark
    },
    "modern_stacked": {
        "name": "Two-Tone Modern Stacked",
        "description": "Editorial split-weight typography with side emblem and gradient divider.",
        "renderer": template_modern_stacked
    },
}

# ──────────────────────────────────────────────────────────────
# 5. Concept Generation Engine (3 Distinct Concepts)
# ──────────────────────────────────────────────────────────────

def generate_3_concepts(brand_design: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generates 3 distinct, high-quality vector logo concepts tailored to the startup.
    Concept 1: Primary recommendation from Gemini / Brand Intelligence.
    Concept 2: Distinct alternative template (e.g. Circular Emblem or Badge).
    Concept 3: Distinct alternative template (e.g. Monogram or Minimal Wordmark).
    """
    brand_name = brand_design.get("company_name") or brand_design.get("brand_name") or "Startup"
    tagline = brand_design.get("tagline") or "EXCELLENCE & INNOVATION"
    category = f"{brand_design.get('business_category', '')} {brand_design.get('business_type', '')} {brand_design.get('idea', '')} {brand_name} {brand_design.get('icon_concept', '')}"
    colors = normalize_colors(brand_design)
    initials = brand_design.get("initials") or extract_initials(brand_name)
    
    # Preferred template from design spec
    pref = (brand_design.get("recommended_template") or brand_design.get("logo_layout") or "").lower()
    
    # Map preferred string to valid layout key
    primary_key = "icon_wordmark"
    if "monogram" in pref or "initial" in pref:
        primary_key = "monogram"
    elif "circular" in pref or "emblem" in pref or "round" in pref:
        primary_key = "circular_emblem"
    elif "badge" in pref or "shield" in pref:
        primary_key = "badge"
    elif "minimal" in pref or "wordmark" in pref:
        primary_key = "minimal_wordmark"
    elif "above" in pref or "stacked" in pref or "center" in pref:
        primary_key = "icon_above_text"
    elif "geometric" in pref or "isometric" in pref:
        primary_key = "geometric_mark_wordmark"
    elif "two-tone" in pref:
        primary_key = "modern_stacked"
        
    # Select two contrasting layouts
    candidates = [
        "icon_wordmark", "circular_emblem", "monogram", "badge",
        "geometric_mark_wordmark", "icon_above_text", "minimal_wordmark", "modern_stacked"
    ]
    
    pool = [k for k in candidates if k != primary_key]
    
    # Choose 2 distinct layout families (e.g. circular vs monogram vs wordmark)
    second_key = "circular_emblem" if primary_key != "circular_emblem" else "badge"
    third_key = "monogram" if primary_key != "monogram" and second_key != "monogram" else "geometric_mark_wordmark"
    
    selected_keys = [primary_key, second_key, third_key]
    
    concepts = []
    for idx, key in enumerate(selected_keys):
        meta = LAYOUT_REGISTRY[key]
        svg_markup = meta["renderer"](brand_name, tagline, category, colors, initials)
        concepts.append({
            "id": idx,
            "layout_key": key,
            "name": f"Concept {idx+1}: {meta['name']}",
            "layout": meta["name"],
            "explanation": meta["description"],
            "svg": svg_markup,
            "colors": colors
        })
        
    return concepts

# ──────────────────────────────────────────────────────────────
# 6. PNG Rendering & Conversion (via resvg-py)
# ──────────────────────────────────────────────────────────────

def render_png(svg_string: str, width: int = 1024, height: int = 1024, transparent: bool = False) -> Optional[bytes]:
    """
    Renders SVG string to high-definition PNG bytes using resvg-py.
    Supports transparent background rendering by removing background <rect>.
    """
    if not HAS_RESVG:
        logger.error("resvg_py is not installed; cannot render PNG.")
        return None
        
    render_svg = svg_string
    if transparent:
        # Replace the first background <rect ... fill=... rx=.../> with transparent fill
        render_svg = re.sub(
            r'<rect\s+width="100%"\s+height="100%"\s+fill="[^"]+"\s+rx="[^"]+"/>',
            '',
            render_svg,
            count=1
        )
        
    try:
        png_bytes = resvg_py.svg_to_bytes(svg_string=render_svg)
        return png_bytes
    except Exception as e:
        logger.error(f"Error rendering SVG to PNG: {e}")
        return None

def generate_favicon_assets(svg_string: str) -> Dict[str, Any]:
    """Generates favicon SVG (compact viewBox) and 512x512 Favicon PNG."""
    favicon_svg = svg_string
    favicon_png = render_png(svg_string, width=512, height=512, transparent=False)
    return {
        "favicon_svg": favicon_svg,
        "favicon_png": favicon_png
    }

# ──────────────────────────────────────────────────────────────
# 7. Brand Asset ZIP Kit Builder
# ──────────────────────────────────────────────────────────────

def generate_brand_kit_zip(branding: Dict[str, Any], selected_concept_id: int = 0) -> bytes:
    """
    Assembles the FounderAI_Brand_Kit.zip package containing:
    /logo/
        logo.svg
        logo.png (1024x1024)
        logo-transparent.png (1024x1024)
        favicon.svg
        favicon.png (512x512)
    /brand/
        brand.json
        colors.json
        typography.json
        brand-preview.html
    """
    concepts = branding.get("logo_concepts") or []
    if not concepts:
        # Generate concepts on the fly
        concepts = generate_3_concepts(branding)
        
    concept = concepts[selected_concept_id] if 0 <= selected_concept_id < len(concepts) else concepts[0]
    svg_data = concept.get("svg") or branding.get("logo_svg", "")
    
    brand_name = branding.get("company_name", "FounderAI Startup")
    tagline = branding.get("tagline", "")
    brand_colors = branding.get("brand_colors", [])
    typography = branding.get("typography", {})
    
    # 1. Render PNG assets
    logo_png = render_png(svg_data, width=1024, height=1024, transparent=False) or b""
    logo_trans_png = render_png(svg_data, width=1024, height=1024, transparent=True) or b""
    favicon_png = render_png(svg_data, width=512, height=512, transparent=False) or b""
    
    # 2. Compile brand JSON files
    brand_meta = {
        "brand_name": brand_name,
        "tagline": tagline,
        "story": branding.get("brand_story", ""),
        "mission": branding.get("mission", ""),
        "vision": branding.get("vision", ""),
        "brand_voice": branding.get("brand_voice", []),
        "brand_identity": branding.get("brand_identity", ""),
        "selected_concept": concept.get("name", "Concept 1")
    }
    
    preview_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{html.escape(brand_name)} — Brand Kit</title>
    <style>
        body {{ font-family: system-ui, sans-serif; background: #070a14; color: #f8fafc; padding: 40px; margin: 0; }}
        .container {{ max-width: 900px; margin: 0 auto; }}
        h1 {{ font-size: 32px; margin-bottom: 8px; color: #ffffff; }}
        p.tagline {{ font-size: 16px; color: #38bdf8; margin-bottom: 30px; }}
        .logo-box {{ width: 340px; height: 340px; margin-bottom: 40px; }}
        .card {{ background: #0f172a; padding: 24px; border-radius: 16px; margin-bottom: 24px; border: 1px solid #1e293b; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>{html.escape(brand_name)}</h1>
        <p class="tagline">{html.escape(tagline)}</p>
        <div class="logo-box">
            {svg_data}
        </div>
        <div class="card">
            <h3>Brand Story</h3>
            <p>{html.escape(branding.get('brand_story', ''))}</p>
        </div>
    </div>
</body>
</html>"""

    # 3. Build in-memory ZIP archive
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        # /logo/
        zf.writestr("logo/logo.svg", svg_data.encode("utf-8"))
        if logo_png:
            zf.writestr("logo/logo.png", logo_png)
        if logo_trans_png:
            zf.writestr("logo/logo-transparent.png", logo_trans_png)
        zf.writestr("logo/favicon.svg", svg_data.encode("utf-8"))
        if favicon_png:
            zf.writestr("logo/favicon.png", favicon_png)
            
        # /brand/
        zf.writestr("brand/brand.json", json.dumps(brand_meta, indent=2).encode("utf-8"))
        zf.writestr("brand/colors.json", json.dumps(brand_colors, indent=2).encode("utf-8"))
        zf.writestr("brand/typography.json", json.dumps(typography, indent=2).encode("utf-8"))
        zf.writestr("brand/brand-preview.html", preview_html.encode("utf-8"))
        
    return zip_buffer.getvalue()
