from datetime import datetime
from .state import AgentState
from ..services.maps import analyze_location_metrics

def digital_twin_agent(state: AgentState) -> AgentState:
    """
    Digital Twin Agent runs spatial location analysis for the primary location.
    Passes the Business Intelligence Profile (BIP) from state into analyze_location_metrics
    so all competitor matching, OSM tag filtering, and financial rate calculations are
    driven by Gemini AI — no hardcoded keyword matching.
    """
    location = state.get("location", "")
    business_type = state.get("business_type", "Cafe")
    budget = state.get("budget", 1000000.0)
    biz_profile = state.get("biz_profile")  # Loaded by founder_agent via get_biz_profile

    # Run maps metrics calculation with AI-powered Business Intelligence Profile
    analysis = analyze_location_metrics(location, business_type, budget, biz_profile=biz_profile)

    step_entry = {
        "agent": "digital_twin",
        "status": "COMPLETED",
        "timestamp": datetime.utcnow().isoformat(),
        "summary": (
            f"Analyzed primary location '{location}' for '{business_type}'. "
            f"Potential score: {analysis['metrics']['potential_score']}/100 | "
            f"Estimated footfall: {analysis['metrics']['estimated_footfall']} people/day | "
            f"Direct competitors found: {analysis['counts'].get('competitors', 0)}."
        )
    }

    return {
        "location_analysis": analysis,
        "current_agent": "finance",
        "workflow_steps": [step_entry]
    }
