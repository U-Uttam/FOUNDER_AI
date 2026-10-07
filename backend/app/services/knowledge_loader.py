"""
Knowledge Loader — Seeds ChromaDB with foundational startup knowledge.

This module populates the `startup_knowledge` collection with curated reference data
that agents can retrieve via RAG to produce more accurate, data-backed outputs.

Categories of seeded knowledge:
  1. Indian startup ecosystem facts (market sizes, city tier data)
  2. Regulatory templates (FSSAI, GST, Shop & Establishment by state)
  3. Financial benchmarks (margins by industry, rent-to-revenue ratios)
  4. Business-type-specific operational knowledge

Usage:
  - Called via POST /api/admin/seed-knowledge endpoint
  - Or directly: python -m app.services.knowledge_loader
"""

import logging
from .chroma import chroma_service

logger = logging.getLogger("founder_ai")


# ─────────────────────────────────────────────────────────────────
# Knowledge Dataset: Curated startup reference data for RAG
# ─────────────────────────────────────────────────────────────────

STARTUP_KNOWLEDGE = [
    # ── Indian Startup Ecosystem ──
    {
        "id": "ecosystem_india_overview",
        "content": (
            "India has the 3rd largest startup ecosystem globally with 100,000+ recognized startups "
            "as of 2025. Key hubs: Bengaluru, Delhi-NCR, Mumbai, Hyderabad, Chennai, Pune. "
            "Tier-2 cities (Jaipur, Lucknow, Coimbatore, Vizag, Indore, Chandigarh) are growing "
            "at 2x the rate of metros for retail and F&B startups. India's consumer spending is "
            "projected at $6 trillion by 2030. The food services industry alone is worth ₹5.99 lakh crore."
        ),
        "metadata": {"source": "ecosystem", "category": "market_overview", "region": "India"}
    },
    {
        "id": "ecosystem_city_tiers",
        "content": (
            "Indian city tier classification for startup planning: "
            "Tier-1 (Metro): Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad — "
            "average commercial rent ₹80-200/sqft, high competition, footfall 5000-15000/day in prime areas. "
            "Tier-2: Jaipur, Lucknow, Chandigarh, Coimbatore, Vizag, Indore, Kochi, Bhopal, Nagpur, Vellore — "
            "average commercial rent ₹30-80/sqft, moderate competition, footfall 2000-6000/day. "
            "Tier-3: Smaller towns — rent ₹15-40/sqft, low competition, footfall 800-2500/day. "
            "Rent-to-revenue ratio should not exceed 15% for sustainability."
        ),
        "metadata": {"source": "ecosystem", "category": "city_economics", "region": "India"}
    },

    # ── Food & Beverage ──
    {
        "id": "fnb_tea_coffee",
        "content": (
            "Tea/Coffee shop startup benchmarks in India: Average ticket size ₹30-80 (tea stall) or "
            "₹120-250 (premium cafe). Gross margins: 65-75% for beverages. Monthly breakeven typically "
            "at 150-250 orders/day. Peak hours: 7-10 AM (35% revenue), 3-6 PM (30% revenue). "
            "Key success factors: location near colleges/offices, consistent quality, speed of service. "
            "Major chains: Chai Point, Chaayos, Tea Trails, Third Wave Coffee, Blue Tokai. "
            "FSSAI registration is mandatory. Initial setup ₹2-8 lakhs for a stall, ₹8-25 lakhs for a cafe."
        ),
        "metadata": {"source": "industry_benchmarks", "category": "food_beverage", "business_type": "tea_coffee"}
    },
    {
        "id": "fnb_restaurant",
        "content": (
            "Restaurant startup benchmarks in India: Average ticket ₹150-500 (casual dining), ₹500-2000 (fine dining). "
            "Food cost ratio should be 28-35% of revenue. Labor cost: 20-25% of revenue. "
            "Breakeven timeline: 12-24 months. Average restaurant fails within 3 years if food cost exceeds 40%. "
            "Key permits: FSSAI license, fire NOC, liquor license (if applicable), health trade license. "
            "Dine-in conversion rate: 2-4% of foot traffic. Delivery can add 30-40% to revenue. "
            "South Indian restaurants have higher margins (70-75% on dosa/idli) vs North Indian (55-65%)."
        ),
        "metadata": {"source": "industry_benchmarks", "category": "food_beverage", "business_type": "restaurant"}
    },
    {
        "id": "fnb_bakery",
        "content": (
            "Bakery/cake shop benchmarks: Average ticket ₹80-200 (counter), ₹500-2000 (custom cakes). "
            "Gross margins: 60-70% on bread/pastries, 50-60% on custom cakes. Peak seasons: festivals, "
            "wedding season (Oct-Feb). Setup cost: ₹5-15 lakhs (small), ₹15-40 lakhs (premium). "
            "Key equipment: commercial oven ₹50K-3L, display counter ₹30K-1L, mixer ₹20K-80K. "
            "Online orders via Swiggy/Zomato typically add 25-35% revenue but with 25-30% commission."
        ),
        "metadata": {"source": "industry_benchmarks", "category": "food_beverage", "business_type": "bakery"}
    },
    {
        "id": "fnb_ice_cream",
        "content": (
            "Ice cream parlour benchmarks: Average ticket ₹60-150 (scoop shop), ₹150-400 (premium/gelato). "
            "Gross margins: 60-70%. Highly seasonal — summer (Mar-Jun) accounts for 45-50% of annual revenue. "
            "Setup cost: ₹3-10 lakhs (kiosk), ₹10-30 lakhs (premium parlour). Critical equipment: "
            "display freezer ₹40K-2L, batch freezer ₹1-5L. Major brands: Naturals, Baskin Robbins, "
            "Amul, Havmor, Cream Stone. Location near schools/colleges is ideal."
        ),
        "metadata": {"source": "industry_benchmarks", "category": "food_beverage", "business_type": "ice_cream"}
    },

    # ── Automotive ──
    {
        "id": "auto_car_wash",
        "content": (
            "Car wash/detailing studio benchmarks: Average ticket ₹300-800 (basic wash), ₹1500-5000 (full detailing). "
            "Gross margins: 65-80% (very high, labor-intensive but low material cost). "
            "Daily capacity: 15-30 cars for a 2-bay setup. Breakeven: 8-15 cars/day. "
            "Setup cost: ₹5-20 lakhs (basic), ₹20-50 lakhs (premium with ceramic coating). "
            "Key permits: Municipal trade license, water usage permit, pollution board NOC. "
            "Loyalty programs drive 40%+ of revenue. Location on main roads with parking is critical."
        ),
        "metadata": {"source": "industry_benchmarks", "category": "automotive", "business_type": "car_wash"}
    },

    # ── Retail & Services ──
    {
        "id": "retail_salon",
        "content": (
            "Salon/beauty parlour benchmarks: Average ticket ₹300-800 (basic services), ₹1000-5000 (premium). "
            "Gross margins: 50-65% after product costs. Key revenue: haircuts (30%), coloring (25%), "
            "facials/skin (20%), bridal packages (15%), products (10%). Breakeven: 10-15 customers/day. "
            "Setup cost: ₹5-15 lakhs (basic), ₹15-50 lakhs (premium unisex). Permits: cosmetology "
            "license, trade license, GST. Top brands: Lakme, VLCC, Naturals, Jawed Habib."
        ),
        "metadata": {"source": "industry_benchmarks", "category": "beauty_salon", "business_type": "salon"}
    },
    {
        "id": "retail_gym",
        "content": (
            "Gym/fitness center benchmarks: Monthly membership ₹800-3000 (basic), ₹3000-10000 (premium). "
            "Revenue mix: memberships (70%), personal training (20%), supplements/merchandise (10%). "
            "Typical member retention: 60-70% after 6 months. Setup cost: ₹15-50 lakhs (basic), "
            "₹50L-2Cr (premium). Breakeven: 150-300 active members. Equipment cost is the largest "
            "capex: treadmills ₹50K-3L each, strength machines ₹30K-2L each. Peak: 6-9 AM, 5-8 PM."
        ),
        "metadata": {"source": "industry_benchmarks", "category": "fitness", "business_type": "gym"}
    },
    {
        "id": "retail_pet_services",
        "content": (
            "Pet grooming/services benchmarks: Average ticket ₹500-2000 per session. "
            "Gross margins: 55-70%. India pet industry growing at 20% CAGR, currently ₹5000 crore market. "
            "Services: grooming (40% revenue), boarding (30%), veterinary referrals (15%), products (15%). "
            "Setup cost: ₹3-12 lakhs. Key compliance: Prevention of Cruelty to Animals Act, "
            "municipal pet shop license, GST. Location near residential areas preferred."
        ),
        "metadata": {"source": "industry_benchmarks", "category": "pet_services", "business_type": "pet_grooming"}
    },

    # ── Technology ──
    {
        "id": "tech_saas",
        "content": (
            "SaaS startup benchmarks India: Average monthly revenue per customer ₹500-50000 depending "
            "on segment (SMB vs Enterprise). Gross margins: 70-85% (highest among all startup types). "
            "Customer Acquisition Cost (CAC): ₹2000-50000. LTV:CAC ratio should exceed 3:1. "
            "Monthly churn below 5% is healthy. Key compliance: Company Registration (MCA), "
            "GSTIN, IT Act compliance, DPDP Act (data privacy). Typical funding: ₹25L-2Cr seed round. "
            "India SaaS market projected at $50B by 2030."
        ),
        "metadata": {"source": "industry_benchmarks", "category": "technology", "business_type": "saas"}
    },

    # ── Regulatory Knowledge ──
    {
        "id": "regulatory_fssai",
        "content": (
            "FSSAI (Food Safety and Standards Authority of India) compliance: "
            "Basic Registration: For businesses with annual turnover < ₹12 lakhs. Cost: ₹100. Time: 7 days. "
            "State License: Turnover ₹12L-20Cr. Cost: ₹2000-5000. Time: 30-60 days. "
            "Central License: Turnover > ₹20Cr or multi-state operations. Cost: ₹7500. Time: 60 days. "
            "Required for: restaurants, cafes, bakeries, food delivery, catering, packaged food. "
            "Penalties for non-compliance: ₹25,000 to ₹5 lakh fine, imprisonment up to 6 months."
        ),
        "metadata": {"source": "regulatory", "category": "food_safety", "region": "India"}
    },
    {
        "id": "regulatory_gst",
        "content": (
            "GST Registration in India: Mandatory if annual turnover exceeds ₹40 lakhs (goods) or "
            "₹20 lakhs (services). For interstate supply, mandatory regardless of turnover. "
            "Registration cost: Free (government portal), ₹1000-3000 via CA. Time: 3-7 working days. "
            "GST rates: Restaurant (without AC) 5% without ITC, Restaurant (with AC) 5% without ITC, "
            "Outdoor catering 5% without ITC, Packaged food items 5-18%, IT services 18%."
        ),
        "metadata": {"source": "regulatory", "category": "taxation", "region": "India"}
    },
    {
        "id": "regulatory_shop_establishment",
        "content": (
            "Shop & Establishment Act registration: Mandatory for all commercial establishments within "
            "30 days of commencement. Governed by respective state governments. "
            "Tamil Nadu: Apply online via TN e-Services. Cost: ₹500-2000. Time: 3-7 days. "
            "Maharashtra: Apply via Aaple Sarkar portal. Cost: ₹200-500. Time: 1-3 days. "
            "Karnataka: Apply via BPASS. Cost: ₹500-1000. Time: 5-10 days. "
            "Regulates working hours, holidays, employment conditions, wages."
        ),
        "metadata": {"source": "regulatory", "category": "labor_law", "region": "India"}
    },
    {
        "id": "regulatory_fire_noc",
        "content": (
            "Fire Safety NOC: Required for commercial establishments exceeding 500 sqft or multi-story "
            "buildings. Applied via local Fire Department. Cost: ₹1000-10000 depending on establishment "
            "size and state. Time: 15-30 days. Requires: fire extinguishers (1 per 1000 sqft), "
            "emergency exit plans, fire alarm system (for areas > 2000 sqft). Renewal: Annual."
        ),
        "metadata": {"source": "regulatory", "category": "fire_safety", "region": "India"}
    },

    # ── Financial Benchmarks ──
    {
        "id": "finance_ratios",
        "content": (
            "Startup financial health benchmarks for Indian businesses: "
            "Rent-to-revenue ratio: Should not exceed 10-15%. "
            "Food cost ratio: 28-35% for restaurants, 20-30% for cafes/bakeries. "
            "Labor cost ratio: 20-30% of revenue (lower for self-operated). "
            "Marketing spend: 5-10% of revenue in first year, 3-5% thereafter. "
            "Working capital: Maintain 3-6 months of operating expenses as reserve. "
            "Payback period: 12-24 months is healthy, >36 months is risky. "
            "Gross margin targets: F&B 60-75%, Services 50-70%, SaaS 70-85%, Retail 30-50%."
        ),
        "metadata": {"source": "financial_benchmarks", "category": "ratios", "region": "India"}
    },
    {
        "id": "finance_funding",
        "content": (
            "Indian startup funding stages and typical amounts: "
            "Bootstrapping/Self-funded: ₹1-20 lakhs (most small businesses). "
            "Friends & Family: ₹5-50 lakhs. "
            "Angel Investment: ₹10 lakhs - ₹2 Cr. Networks: Indian Angel Network, Mumbai Angels, LetsVenture. "
            "Seed Round: ₹25 lakhs - ₹5 Cr. "
            "Government schemes: PMEGP (₹25-50 lakhs with 25-35% subsidy), Mudra Loan (up to ₹10 lakhs), "
            "Startup India Seed Fund (up to ₹50 lakhs), Stand-Up India (₹10 lakhs - ₹1 Cr)."
        ),
        "metadata": {"source": "financial_benchmarks", "category": "funding", "region": "India"}
    },
]


def seed_knowledge() -> dict:
    """
    Seeds the ChromaDB startup_knowledge collection with curated reference data.
    Safe to call multiple times — uses upsert so existing docs are updated, not duplicated.

    Returns a summary dict with counts.
    """
    
    if not chroma_service.knowledge_collection:
        logger.error("Cannot seed knowledge: ChromaDB knowledge collection unavailable.")
        return {"status": "error", "message": "ChromaDB unavailable", "documents_loaded": 0}

    loaded = 0
    for item in STARTUP_KNOWLEDGE:
        try:
            chroma_service.add_knowledge(
                doc_id=item["id"],
                content=item["content"],
                metadata=item["metadata"]
            )
            loaded += 1
        except Exception as e:
            logger.error(f"Failed to seed knowledge doc '{item['id']}': {e}")

    stats = chroma_service.get_stats()
    logger.info(
        f"Knowledge seeding complete: {loaded}/{len(STARTUP_KNOWLEDGE)} documents loaded. "
        f"Total in collection: {stats['knowledge_documents']}"
    )

    return {
        "status": "success",
        "documents_loaded": loaded,
        "total_available": len(STARTUP_KNOWLEDGE),
        "collection_stats": stats
    }


if __name__ == "__main__":
    # Allow direct execution: python -m app.services.knowledge_loader
    import sys
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    result = seed_knowledge()
    print(f"\nKnowledge seeding result: {result}")
    sys.exit(0 if result["status"] == "success" else 1)
