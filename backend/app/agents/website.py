from datetime import datetime
from .state import AgentState
from ..services.rag_engine import generate_with_rag
from ..services.gemini import get_structured_fallback
import logging

logger = logging.getLogger("founder_ai")

def website_agent(state: AgentState) -> AgentState:
    """
    Website Agent designs landing page content, layout config, colors, and typography
    tailored to the SPECIFIC business type. Uses the Business Intelligence Profile's
    website_aesthetic field to guide design style — no locked template categories.
    """
    idea = state.get("idea", "")
    business_type = state.get("business_type", "Cafe")
    location = state.get("location", "")
    branding = state.get("branding") or {}
    company_name = branding.get("company_name", "the startup")
    brand_colors = branding.get("brand_colors") or []
    typography = branding.get("typography") or {}
    biz_profile = state.get("biz_profile") or {}
    website_aesthetic = biz_profile.get("website_aesthetic", "clean, modern, professional")
    
    # Map colors
    colors_dict = {"primary": "#2B1B17", "secondary": "#F5E6D3", "accent": "#D4AF37", "text": "#1A1A1A"}
    for color in brand_colors:
        if not isinstance(color, dict):
            continue
        role = color.get("name", "").lower()
        if "primary" in role:
            colors_dict["primary"] = color.get("hex", "#2B1B17")
        elif "secondary" in role:
            colors_dict["secondary"] = color.get("hex", "#F5E6D3")
        elif "accent" in role or "gold" in role:
            colors_dict["accent"] = color.get("hex", "#D4AF37")
            
    prompt = f"""
    You are the Website Agent. Design the landing page content and layout config for "{company_name}".
    Idea: "{idea}"
    Business Type: "{business_type}"
    Recommended colors: {colors_dict}
    Recommended typography: {typography}
    Design Aesthetic from Business Intelligence: "{website_aesthetic}"

    Tasks:
    1. Select a template_category that best describes the visual layout style for this specific business.
       Common options include: coffee_shop, restaurant, gym, salon, hospital, education, it_company,
       retail_store, ice_cream_parlour, bookstore, pet_grooming, pharmacy, bakery, automotive,
       spa_wellness, juice_bar, co_working, flower_shop, electronics_store, event_venue.
       You are NOT limited to this list — create a new slug (snake_case) if none fits perfectly.
       The template_category determines the overall layout, imagery, and interaction style.
    2. Define colors and fonts matching the brand identity and the design aesthetic.
    3. Generate landing page sections:
       - hero: title, subtitle, cta_text, background_image (relevant high-res photo URL or keyword query)
       - about: title, content (about the company and its local mission)
       - services: 3 specific, action-oriented services offered by THIS business type (NOT generic placeholders like "Basic Service").
         Examples:
         - For Car Wash: "High-Pressure Snow Foam Hand Wash", "Interior Steam Sanitization & Vacuuming", "9H Nano Ceramic Coating & Machine Buffer"
         - For Restaurant: "Traditional Wood-Fire Handi Dum Biryani", "Authentic Banana Leaf Thali Feast", "Chettinad Claypot Mutton Chukka"
         - For Cafe: "Artisan Single-Origin Espresso & Latte Art", "Fresh Organic French Sourdough & Croissants", "Nitro Cold Brew & Pour Over Tasting"
         - For Gym: "1-on-1 Certified Personal Strength Coaching", "High-Intensity Functional CrossFit Circuit", "Post-Workout Recovery & Mobility Spa"
         Each service MUST include an "image_query" (concise visual prompt, e.g. "man cleaning car exterior with foam sponge", "technician vacuuming car interior upholstery")
       - contact: address, phone, email, hours
       - faqs: 2 frequently asked questions specific to this business type
       
    Return a JSON object matching this structure:
    {{
        "template_category": "string",
        "colors": {{
            "primary": "#HEX",
            "secondary": "#HEX",
            "accent": "#HEX",
            "text": "#HEX"
        }},
        "fonts": {{
            "heading": "font name",
            "body": "font name"
        }},
        "hero": {{
            "title": "string",
            "subtitle": "string",
            "cta_text": "string",
            "background_image": "string"
        }},
        "about": {{
            "title": "string",
            "content": "string"
        }},
        "services": [
            {{"title": "string", "description": "string", "image_query": "string"}},
            ...
        ],
        "contact": {{
            "address": "string",
            "phone": "string",
            "email": "string",
            "hours": "string"
        }},
        "faqs": [
            {{"question": "string", "answer": "string"}},
            ...
        ]
    }}
    """
    
    try:
        result = generate_with_rag(prompt, agent_name="website", business_type=business_type, location=location) or {}
        if not result or not isinstance(result, dict) or "hero" not in result or "services" not in result:
            logger.warning("[website_agent] Gemini returned empty/invalid result, using structured fallback.")
            result = get_structured_fallback(f"Website Agent template_category for: {idea} in {company_name}")
    except Exception as e:
        logger.error(f"[website_agent] Exception calling Gemini: {e}. Using structured fallback.")
        result = get_structured_fallback(f"Website Agent template_category for: {idea} in {company_name}")

    if not result or not isinstance(result, dict):
        result = get_structured_fallback(f"Website Agent template_category for: {idea} in {company_name}")

    # Ensure required sections
    fallback = get_structured_fallback(f"Website Agent template_category for: {idea} in {company_name}")
    if "template_category" not in result:
        result["template_category"] = fallback.get("template_category", "local_business")
    if "hero" not in result or not isinstance(result.get("hero"), dict):
        result["hero"] = fallback.get("hero", {})
    if "about" not in result or not isinstance(result.get("about"), dict):
        result["about"] = fallback.get("about", {})
    if "services" not in result or not isinstance(result.get("services"), list) or len(result["services"]) == 0:
        result["services"] = fallback.get("services", [])
    if "contact" not in result or not isinstance(result.get("contact"), dict):
        result["contact"] = fallback.get("contact", {})
    if "faqs" not in result or not isinstance(result.get("faqs"), list):
        result["faqs"] = fallback.get("faqs", [])
    if "colors" not in result:
        result["colors"] = fallback.get("colors", colors_dict)
    if "fonts" not in result:
        result["fonts"] = fallback.get("fonts", {"heading": "Outfit", "body": "Inter"})

    step_entry = {
        "agent": "website",
        "status": "COMPLETED",
        "timestamp": datetime.utcnow().isoformat(),
        "summary": f"Selected '{result.get('template_category')}' template and customized landing page copy and image assets."
    }

    return {
        "website": result,
        "current_agent": "pitch_deck",
        "workflow_steps": [step_entry]
    }
