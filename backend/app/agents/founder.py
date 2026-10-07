import logging
from datetime import datetime
from .state import AgentState
from ..services.gemini import generate_json_with_gemini

logger = logging.getLogger("founder_ai")

def founder_agent(state: AgentState) -> AgentState:
    """
    Founder Agent analyzes the initial pitch, classifies the business type, generates the
    Business Intelligence Profile (BIP) that drives ALL downstream agents, and prepares
    the execution workflow plan. No hardcoded keyword matching — everything via Gemini.
    """
    idea = state.get("idea", "")
    budget = state.get("budget", 0)
    location = state.get("location", "")

    prompt = f"""
    You are the Founder Agent. A client wants to build a startup.
    Idea: "{idea}"
    Budget: ₹{budget}
    Location: "{location}"

    Analyze the idea and determine:
    1. A precise business_type classification (e.g., "Ice Cream Parlour", "Premium Car Wash & Detailing Studio",
       "South Indian Veg Restaurant", "Pet Grooming Salon", "Second-hand Bookstore", "SaaS B2B Platform").
       Be specific — do NOT use generic labels like "Food & Beverage" or "Retail".
    2. A structured execution workflow listing the sequence of operational steps (1 to 9).

    Return a JSON object matching this structure:
    {{
        "business_type": "string — specific and descriptive business classification",
        "extracted_budget": float,
        "extracted_location": "string",
        "execution_workflow": [
            {{"step": 1, "agent": "research", "description": "Conduct market and SWOT analysis"}},
            ...
        ]
    }}
    """

    result = generate_json_with_gemini(prompt)

    # Update state with AI-classified business type
    state["business_type"] = result.get("business_type", idea)
    state["current_agent"] = "research"

    # Geocode and resolve canonical geographic context for downstream agents
    try:
        from ..services.maps import geocode_location
        geo_info = geocode_location(location)
        if geo_info:
            state["geo_info"] = geo_info
            logger.info(f"[founder_agent] Resolved '{location}' -> '{geo_info.get('display_name')}' ({geo_info.get('lat')}, {geo_info.get('lng')})")
    except Exception as ge:
        logger.warning(f"[founder_agent] Location geocoding note: {ge}")

    # Generate Business Intelligence Profile (BIP) for this specific startup idea
    # The BIP flows through ALL downstream agents: digital_twin, website, compliance, marketing
    try:
        from ..services.biz_profile import get_biz_profile
        biz_profile = get_biz_profile(state["business_type"], location)
        state["biz_profile"] = biz_profile
        logger.info(
            f"[founder_agent] BIP generated: '{biz_profile.get('normalized_name')}' | "
            f"slug={biz_profile.get('category_slug')} | "
            f"ticket=₹{biz_profile.get('avg_ticket_inr')} | "
            f"rate={biz_profile.get('conversion_rate_pct')}% | "
            f"compliance={biz_profile.get('compliance_category')} | "
            f"brands={biz_profile.get('competitor_brands', [])[:3]}..."
        )
    except Exception as e:
        logger.warning(f"[founder_agent] BIP generation failed: {e}. Agents will use keyword fallbacks.")
        state["biz_profile"] = None

    # Track workflow step
    step_entry = {
        "agent": "founder",
        "status": "COMPLETED",
        "timestamp": datetime.utcnow().isoformat(),
        "summary": (
            f"Classified startup as '{state['business_type']}' and generated Business Intelligence Profile "
            f"({state['biz_profile'].get('normalized_name', 'N/A') if state.get('biz_profile') else 'unavailable'})."
        )
    }
    return {
        "business_type": state["business_type"],
        "biz_profile": state["biz_profile"],
        "current_agent": "research",
        "workflow_steps": [step_entry]
    }
