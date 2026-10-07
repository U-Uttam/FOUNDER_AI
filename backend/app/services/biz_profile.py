import logging
from typing import Dict, Any

logger = logging.getLogger("founder_ai")

# Module-level cache: avoid redundant Gemini calls for the same business type in a session
_profile_cache: Dict[str, Dict[str, Any]] = {}


def get_biz_profile(business_type: str, location: str = "") -> Dict[str, Any]:
    """
    Calls Gemini to produce a Business Intelligence Profile (BIP) for any startup idea.

    The BIP is the single source of truth that replaces ALL hardcoded if/elif keyword
    chains across maps.py and agent files. It drives:
      - OSM tag matching for competitor detection in Overpass
      - Name keyword matching for is_actual_competitor()
      - Financial rates: avg ticket, conversion rate, peak hours
      - Competitor brand fallback names (specific to the business type)
      - Website design aesthetic
      - Compliance regulatory category

    Results are cached by (business_type, location) to avoid duplicate API calls.
    """
    from .gemini import generate_json_with_gemini

    cache_key = f"{business_type.lower().strip()}::{location.lower().strip()}"
    if cache_key in _profile_cache:
        logger.info(f"BIP cache hit for '{business_type}'")
        return _profile_cache[cache_key]

    prompt = """
    You are a startup market intelligence expert. A founder wants to open a "{business_type}" in "{location or 'India'}".

    Generate a precise Business Intelligence Profile (BIP) for this EXACT business idea in "{location or 'India'}".
    Be very specific — distinguish between a Coffee Shop vs Tea House, a Gym vs a Yoga Studio,
    a Pet Grooming Salon vs a Veterinary Clinic, an Ice Cream Parlour vs a Dessert Cafe, etc.

    === Field-by-field instructions ===

    "osm_tags": OpenStreetMap tag pairs to find DIRECT competitors of this business in OSM map data.
    Use ONLY these OSM keys: amenity, shop, leisure, tourism, office, healthcare.
    Be specific to the business:
      Coffee Shop / Tea Stall → [["amenity","cafe"],["shop","tea"],["shop","coffee"],["amenity","restaurant"]]
      Car Wash        → [["amenity","car_wash"],["shop","car_repair"]]
      Ice Cream Shop  → [["amenity","ice_cream"],["shop","ice_cream"]]
      Pet Grooming    → [["shop","pet"],["shop","pet_grooming"]]

    "osm_amenity_extra": Single most specific OSM amenity tag value for this business.
      If none applies, use empty string "".
    "osm_shop_extra": Single most specific OSM shop tag value for this business.
      If none applies, use empty string "".

    "name_keywords": Exact words/phrases that appear in names of DIRECT competitor businesses for this specific business type.
      Aim for 10-18 keywords.

    "competitor_brands": 8-15 real brand names and real existing competitor businesses operating specifically in and around "{location}" for "{business_type}".
      IMPORTANT: You MUST identify actual, verified competitors located in or serving "{location}". DO NOT use placeholder names or unrelated cities.

    "avg_ticket_inr": Realistic average single transaction value in Indian Rupees (INR).
    "conversion_rate_pct": % of people walking past who actually buy (range: 0.4 to 6.0).
    "peak_hours": % of daily customers per time slot. Must sum to EXACTLY 100.
    "primary_customer_segments": 3 specific real customer profiles for this business type in this location.
    "website_aesthetic": Specific visual design style, color mood, and UI personality for this business.
    "compliance_category": Most applicable regulatory category. Must be EXACTLY one of:
      food_and_beverage | automotive | health_wellness | fitness | education | retail |
      hospitality | technology | professional_services | beauty_salon | pharmacy | pet_services | other

    Return ONLY valid JSON (no markdown, no explanation):
    {
      "normalized_name": "string — clean business type name, e.g. Quick Service Tea & Coffee Outlet",
      "category_slug": "string — snake_case, e.g. tea_stall",
      "osm_tags": [["key", "value"], ...],
      "osm_amenity_extra": "string",
      "osm_shop_extra": "string",
      "name_keywords": ["string", ...],
      "competitor_brands": ["string", ...],
      "avg_ticket_inr": float,
      "conversion_rate_pct": float,
      "peak_hours": {"morning_pct": int, "afternoon_pct": int, "evening_pct": int, "night_pct": int},
      "primary_customer_segments": ["string", "string", "string"],
      "website_aesthetic": "string",
      "compliance_category": "string"
    }
    """.replace("{business_type}", business_type).replace("{location}", location or 'India')

    _default_profile = {
        "normalized_name": business_type,
        "category_slug": business_type.lower().replace(" ", "_").replace("/", "_").replace("-", "_"),
        "osm_tags": [["shop", "convenience"]],
        "osm_amenity_extra": "",
        "osm_shop_extra": "",
        "name_keywords": [w for w in business_type.lower().split() if len(w) > 3],
        "competitor_brands": [],
        "avg_ticket_inr": 350.0,
        "conversion_rate_pct": 2.5,
        "peak_hours": {"morning_pct": 25, "afternoon_pct": 35, "evening_pct": 30, "night_pct": 10},
        "primary_customer_segments": ["General public", "Local residents", "Working professionals"],
        "website_aesthetic": "Clean, modern, and professional with neutral tones and clear typography",
        "compliance_category": "other"
    }

    try:
        result = generate_json_with_gemini(prompt)
        if result and isinstance(result, dict) and "normalized_name" in result:
            # Validate and fix peak_hours so they sum to ~100
            ph = result.get("peak_hours", {})
            ph_sum = (
                ph.get("morning_pct", 0) + ph.get("afternoon_pct", 0) +
                ph.get("evening_pct", 0) + ph.get("night_pct", 0)
            )
            if abs(ph_sum - 100) > 5 or ph_sum == 0:
                result["peak_hours"] = _default_profile["peak_hours"]

            # Validate osm_tags structure
            raw_tags = result.get("osm_tags", [])
            if not isinstance(raw_tags, list) or not raw_tags:
                result["osm_tags"] = _default_profile["osm_tags"]
            else:
                # Normalize each tag pair to ensure it's exactly [key, value]
                result["osm_tags"] = [
                    [str(t[0]), str(t[1])] for t in raw_tags if isinstance(t, (list, tuple)) and len(t) == 2
                ] or _default_profile["osm_tags"]

            # Ensure numeric fields are correct types
            result["avg_ticket_inr"] = float(result.get("avg_ticket_inr") or _default_profile["avg_ticket_inr"])
            result["conversion_rate_pct"] = float(result.get("conversion_rate_pct") or _default_profile["conversion_rate_pct"])

            # Ensure string fields
            result["osm_amenity_extra"] = str(result.get("osm_amenity_extra") or "").strip()
            result["osm_shop_extra"] = str(result.get("osm_shop_extra") or "").strip()

            # Discover verified hyperlocal competitors using web evidence + strict micro-market boundary enforcement
            if location:
                try:
                    from .competitor_intel import discover_hyperlocal_competitors
                    comp_intel = discover_hyperlocal_competitors(business_type, location)
                    if comp_intel and comp_intel.get("competitors"):
                        result["competitors_detailed"] = comp_intel["competitors"]
                        result["competitor_brands"] = comp_intel["competitor_names"]
                        # Also inject competitor names into name_keywords for OSM POI matching
                        existing_kw = set(result.get("name_keywords", []))
                        for c in comp_intel["competitors"]:
                            c_name = c["name"]
                            for token in c_name.split():
                                if len(token) > 3 and token.lower() not in {"store", "outlet", "shop", "center", "ltd", "near"}:
                                    existing_kw.add(token.lower())
                        result["name_keywords"] = list(existing_kw)
                        logger.info(f"BIP injected {len(comp_intel['competitors'])} verified hyperlocal competitors for '{business_type}' in '{location}'")
                except Exception as ce:
                    logger.warning(f"Hyperlocal competitor discovery failed in BIP: {ce}")

            _profile_cache[cache_key] = result
            logger.info(
                f"BIP generated for '{business_type}' @ '{location}': "
                f"normalized='{result.get('normalized_name')}' | "
                f"ticket=₹{result.get('avg_ticket_inr')} | "
                f"conversion={result.get('conversion_rate_pct')}% | "
                f"OSM={result.get('osm_tags')} | "
                f"brands={len(result.get('competitor_brands', []))} found"
            )
            return result

    except Exception as e:
        logger.warning(f"BIP Gemini call failed for '{business_type}': {e}. Using fallback profile.")

    _profile_cache[cache_key] = _default_profile
    return _default_profile


def clear_profile_cache() -> None:
    """Clears the in-memory BIP cache. Useful for testing or forced refresh."""
    global _profile_cache
    _profile_cache = {}
    logger.info("BIP cache cleared.")
