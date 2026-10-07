from datetime import datetime
from .state import AgentState
from ..services.rag_engine import generate_with_rag
from ..services.gemini import get_structured_fallback
from ..services.logo_engine import generate_3_concepts, extract_initials, normalize_colors
import logging

logger = logging.getLogger("founder_ai")

def branding_agent(state: AgentState) -> AgentState:
    """
    Branding Agent acts as the Brand Design Brain.
    It produces a structured brand design JSON package and drives the local
    SVG Logo Engine to generate 3 personalized, editable vector logo concepts.
    """
    idea = state.get("idea", "")
    business_type = state.get("business_type", "")
    location = state.get("location", "India")
    biz_profile = state.get("biz_profile") or {}
    
    # Extract hints from BIP if available
    aesthetic_hint = biz_profile.get("website_aesthetic", "")
    category_hint = biz_profile.get("compliance_category", business_type)
    
    prompt = f"""
    You are the Branding Agent — the Brand Design Brain for FounderAI.
    Startup Idea: "{idea}"
    Business Type: "{business_type}"
    Target Location: "{location}"
    Aesthetic Direction: "{aesthetic_hint}"
    Category: "{category_hint}"
    
    Tasks:
    1. Propose a modern, memorable, and industry-appropriate Company Name.
    2. Write an inspiring, concise Tagline (max 8 words).
    3. Determine the short name and 2-3 letter initials for monogram designs.
    4. Formulate 3-4 distinct brand personality attributes (e.g. ["modern", "artisanal", "trustworthy"]).
    5. Choose the most fitting Logo Layout from these 8 templates:
       - "icon_wordmark" (Horizontal icon + typography)
       - "circular_emblem" (Circular seal with concentric rings)
       - "monogram" (Hexagonal/diamond initials crest)
       - "badge" (Heraldic shield container)
       - "icon_above_text" (Centered emblem stacked above name)
       - "geometric_mark_wordmark" (Isometric/polygonal tech mark)
       - "minimal_wordmark" (Clean typographic wordmark)
       - "modern_stacked" (Two-tone split weight typography)
    6. Describe the Icon Concept specifically relevant to "{idea}" (e.g. "tea leaf and cup", "cyber security shield", "harvest basket").
    7. Curate a harmonious, high-contrast 4-color palette with hex codes:
       - Primary Color (dominant brand color)
       - Secondary Color (support/gradient color)
       - Accent Color (vibrant highlight/badge color)
       - Text Color (legible text, e.g. #F8FAFC)
    8. Draft a short, evocative Brand Story (2-3 sentences), Mission, and Vision statements.
    9. Define Brand Voice (3 adjectives with application guidance).
    10. Recommend Heading and Body Typography pairings.
    
    Return ONLY a JSON object matching this structure:
    {{
        "company_name": "string",
        "short_name": "string",
        "initials": "string",
        "tagline": "string",
        "business_category": "string",
        "brand_personality": ["string", "string", "string"],
        "logo_style": "string",
        "logo_layout": "one of: icon_wordmark, circular_emblem, monogram, badge, icon_above_text, geometric_mark_wordmark, minimal_wordmark, modern_stacked",
        "icon_concept": "string",
        "primary_color": "#HEXCODE",
        "secondary_color": "#HEXCODE",
        "accent_color": "#HEXCODE",
        "text_color": "#HEXCODE",
        "font_style": "string",
        "recommended_template": "string",
        "design_reason": "string",
        "brand_story": "string",
        "mission": "string",
        "vision": "string",
        "brand_voice": ["string", "string", "string"],
        "brand_colors": [
            {{"name": "color role name", "hex": "#HEXCODE", "use": "intended UI use"}}
        ],
        "typography": {{
            "headings": "font name",
            "body": "font name",
            "rationale": "string"
        }},
        "logo_prompt": "string"
    }}
    """
    
    result = None
    try:
        result = generate_with_rag(prompt, agent_name="branding", business_type=business_type)
        if not result or not isinstance(result, dict) or "company_name" not in result:
            result = get_structured_fallback(f"Branding Agent company_name for: {idea} in {location}")
    except Exception as e:
        logger.error(f"[branding_agent] Error calling RAG/Gemini: {e}")
        result = get_structured_fallback(f"Branding Agent company_name for: {idea} in {location}")

    if not result or not isinstance(result, dict) or "company_name" not in result:
        result = get_structured_fallback(f"Branding Agent company_name for: {idea} in {location}")
        
    company_name = result.get("company_name", "Vanguard Creations").strip()
    tagline = result.get("tagline", "ELEVATING EXCELLENCE").strip()
    
    # Build or refine structured brand design object
    brand_design = result.get("brand_design") or {}
    brand_design["brand_name"] = company_name
    brand_design["company_name"] = company_name
    brand_design["tagline"] = tagline
    brand_design["initials"] = result.get("initials") or brand_design.get("initials") or extract_initials(company_name)
    brand_design["business_category"] = result.get("business_category") or business_type or "Startup"
    brand_design["business_type"] = business_type
    brand_design["idea"] = idea
    brand_design["icon_concept"] = result.get("icon_concept") or brand_design.get("icon_concept") or business_type
    brand_design["recommended_template"] = result.get("recommended_template") or result.get("logo_layout") or brand_design.get("recommended_template") or "icon_wordmark"
    brand_design["primary_color"] = result.get("primary_color") or brand_design.get("primary_color") or "#6366F1"
    brand_design["secondary_color"] = result.get("secondary_color") or brand_design.get("secondary_color") or "#06B6D4"
    brand_design["accent_color"] = result.get("accent_color") or brand_design.get("accent_color") or "#F59E0B"
    brand_design["text_color"] = result.get("text_color") or brand_design.get("text_color") or "#F8FAFC"
    brand_design["brand_personality"] = result.get("brand_personality") or brand_design.get("brand_personality") or ["modern", "premium", "trustworthy"]
    
    # Generate 3 distinct programmatic vector logo concepts using Logo Engine
    try:
        concepts = generate_3_concepts(brand_design)
    except Exception as e:
        logger.error(f"[branding_agent] Logo engine generation error: {e}")
        from ..services.logo_engine import template_icon_wordmark
        fallback_colors = normalize_colors(brand_design)
        concepts = [{
            "id": 0,
            "layout_key": "icon_wordmark",
            "name": "Concept 1: Modern Icon + Wordmark",
            "layout": "Modern Icon + Wordmark",
            "explanation": "Balanced horizontal vector emblem with clean typography.",
            "svg": template_icon_wordmark(company_name, tagline, business_type, fallback_colors, brand_design["initials"]),
            "colors": fallback_colors
        }]

    # Update result dictionary with logo engine deliverables
    result["brand_design"] = brand_design
    result["logo_concepts"] = concepts
    result["selected_logo_concept"] = 0
    result["logo_svg"] = concepts[0]["svg"] if concepts else result.get("logo_svg", "")
    
    # Ensure brand_colors list exists for downstream agents and UI
    if not result.get("brand_colors") or not isinstance(result["brand_colors"], list):
        result["brand_colors"] = [
            {"name": "Primary Brand", "hex": brand_design["primary_color"], "use": "Core identity & primary elements"},
            {"name": "Secondary Accent", "hex": brand_design["secondary_color"], "use": "Gradients & UI highlights"},
            {"name": "Vibrant Highlight", "hex": brand_design["accent_color"], "use": "Badges and call-to-action"},
            {"name": "Dark Foundation", "hex": "#070A14", "use": "Dark container backgrounds"},
            {"name": "Text Slate", "hex": "#F8FAFC", "use": "High-contrast typography"}
        ]
        
    step_entry = {
        "agent": "branding",
        "status": "COMPLETED",
        "timestamp": datetime.utcnow().isoformat(),
        "summary": f"Generated personalized brand identity for '{company_name}' with 3 vector logo concepts."
    }

    return {
        "branding": result,
        "current_agent": "product",
        "workflow_steps": [step_entry]
    }
