"""
Comprehensive Verification Suite for FounderAI Personalized Logo Generation System
Tests the 5 required startup examples, all 8 logo templates, category vector icon library,
resvg-py PNG conversion, Brand Kit ZIP packaging, and downstream agent compatibility.
"""

import xml.etree.ElementTree as ET
import pytest
from app.services.logo_engine import (
    generate_3_concepts,
    render_png,
    generate_favicon_assets,
    generate_brand_kit_zip,
    extract_initials,
    LAYOUT_REGISTRY
)
from app.agents.branding import branding_agent
from app.agents.product import product_agent

STARTUP_TEST_CASES = [
    {
        "name": "TeaVerse",
        "idea": "Premium Tea Shop",
        "location": "Katpadi",
        "category": "Tea House",
        "expected_initials": "TV",
        "expected_keyword": "tea"
    },
    {
        "name": "Nexora AI",
        "idea": "AI Cybersecurity Startup",
        "location": "Bengaluru",
        "category": "Cybersecurity & AI",
        "expected_initials": "NA",
        "expected_keyword": "cyber"
    },
    {
        "name": "GreenBasket",
        "idea": "Organic Grocery Store",
        "location": "Chennai",
        "category": "Organic Retail",
        "expected_initials": "GB",
        "expected_keyword": "grocery"
    },
    {
        "name": "FitForge",
        "idea": "Fitness Center",
        "location": "Vellore",
        "category": "Fitness & Gym",
        "expected_initials": "FF",
        "expected_keyword": "fit"
    },
    {
        "name": "Annapoorna Foods",
        "idea": "South Indian Restaurant",
        "location": "Vellore",
        "category": "Restaurant & Dining",
        "expected_initials": "AF",
        "expected_keyword": "restaurant"
    },
]

def test_initials_extraction():
    """Verify smart monogram initials calculation."""
    assert extract_initials("TeaVerse") == "TV"
    assert extract_initials("Nexora AI") == "NA"
    assert extract_initials("GreenBasket") == "GB"
    assert extract_initials("FitForge") == "FF"
    assert extract_initials("Annapoorna Foods") == "AF"
    assert extract_initials("Vellore Brew House") == "VBH"

def test_all_8_layout_templates():
    """Verify that all 8 layout templates render valid SVGs."""
    colors = {
        "primary": "#6366F1",
        "secondary": "#38BDF8",
        "accent": "#F59E0B",
        "bg": "#070A14",
        "text": "#F8FAFC"
    }
    for key, meta in LAYOUT_REGISTRY.items():
        svg = meta["renderer"]("TestBrand", "Excellence Driven", "Technology", colors, "TB")
        assert svg.startswith("<svg")
        assert svg.endswith("</svg>")
        assert 'viewBox="0 0 500 500"' in svg
        # Validate XML structure
        root = ET.fromstring(svg)
        assert root.tag.endswith("svg")

@pytest.mark.parametrize("startup", STARTUP_TEST_CASES)
def test_startup_logo_generation_flow(startup):
    """Verify each of the 5 required startup examples."""
    brand_design = {
        "company_name": startup["name"],
        "brand_name": startup["name"],
        "tagline": f"Premium {startup['category']}",
        "business_category": startup["category"],
        "icon_concept": startup["idea"],
        "initials": startup["expected_initials"],
        "recommended_template": "icon_wordmark",
        "primary_color": "#6366F1",
        "secondary_color": "#06B6D4",
        "accent_color": "#F59E0B"
    }
    
    # 1. Generate 3 distinct concepts
    concepts = generate_3_concepts(brand_design)
    assert len(concepts) == 3
    
    # Layouts must be meaningfully distinct
    layout_keys = [c["layout_key"] for c in concepts]
    assert len(set(layout_keys)) == 3, f"Concepts are not distinct: {layout_keys}"
    
    # Check concept 1 SVG
    active_svg = concepts[0]["svg"]
    root = ET.fromstring(active_svg)
    assert root.tag.endswith("svg")
    
    # 2. Render 1024x1024 HD PNG via resvg-py
    png_bytes = render_png(active_svg, width=1024, height=1024, transparent=False)
    assert png_bytes is not None
    assert len(png_bytes) > 1000
    assert png_bytes[:8] == b'\x89PNG\r\n\x1a\n'  # Valid PNG signature
    
    # 3. Render 1024x1024 Transparent PNG
    trans_bytes = render_png(active_svg, width=1024, height=1024, transparent=True)
    assert trans_bytes is not None
    assert len(trans_bytes) > 1000
    assert trans_bytes[:8] == b'\x89PNG\r\n\x1a\n'
    
    # 4. Generate Favicon
    favicons = generate_favicon_assets(active_svg)
    assert "favicon_svg" in favicons
    assert favicons["favicon_png"] is not None
    assert len(favicons["favicon_png"]) > 500
    
    # 5. Generate Brand Kit ZIP archive
    zip_bytes = generate_brand_kit_zip({
        "company_name": startup["name"],
        "tagline": brand_design["tagline"],
        "logo_concepts": concepts,
        "brand_story": f"{startup['name']} in {startup['location']}",
        "mission": "Deliver excellence",
        "vision": "Lead the industry",
        "brand_colors": [{"name": "Primary", "hex": "#6366F1", "use": "Primary"}],
        "typography": {"headings": "Outfit", "body": "Inter", "rationale": "High contrast"}
    })
    assert zip_bytes is not None
    assert len(zip_bytes) > 5000
    assert zip_bytes[:4] == b'PK\x03\x04'  # Valid ZIP header

def test_branding_agent_and_downstream_compatibility():
    """Verify Branding Agent executes and downstream Product Agent consumes its output cleanly."""
    state = {
        "idea": "Premium Tea Shop",
        "business_type": "Tea House",
        "location": "Katpadi, Vellore",
        "budget": 500000.0,
        "workflow_steps": [],
        "errors": []
    }
    
    # 1. Run Branding Agent
    branding_out = branding_agent(state)
    assert "branding" in branding_out
    assert branding_out["current_agent"] == "product"
    
    branding = branding_out["branding"]
    assert "company_name" in branding
    assert "logo_svg" in branding
    assert "logo_concepts" in branding
    assert len(branding["logo_concepts"]) == 3
    assert "brand_colors" in branding
    assert len(branding["brand_colors"]) >= 3
    
    # 2. Pass to downstream Product Agent
    updated_state = {**state, **branding_out}
    product_out = product_agent(updated_state)
    assert "product" in product_out
    assert product_out["current_agent"] == "marketing"
    assert "usp" in product_out["product"]
