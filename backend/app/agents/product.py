from datetime import datetime
from .state import AgentState
from ..services.rag_engine import generate_with_rag
from ..services.gemini import get_structured_fallback
import logging

logger = logging.getLogger("founder_ai")

def product_agent(state: AgentState) -> AgentState:
    """
    Product Agent defines the product architecture, USP, Lean Business Canvas, and development roadmap.
    """
    idea = state.get("idea", "")
    business_type = state.get("business_type", "")
    company_name = (state.get("branding") or {}).get("company_name", "the startup")
    
    prompt = f"""
    You are the Product Agent. Design the product and service roadmap for "{company_name}".
    Idea: "{idea}"
    Business Type: "{business_type}"
    
    Tasks:
    1. Define the Unique Selling Proposition (USP) clearly.
    2. Develop 2 detailed Customer Personas (name & age, role/archetype, goals, pain points).
    3. Construct a Lean Business Model Canvas containing: Key Partners, Value Propositions, Revenue Streams, and Cost Structure.
    4. Propose a 4-Phase rollout timeline (Phase, Tasks).
    5. Draft a detailed Value Proposition statement.
    6. Design a Customer Journey map with 5 stages (Awareness, Consideration, Purchase, Service, Loyalty) listing what they do and how they feel.
    
    Return a JSON object matching this structure:
    {{
        "usp": "string",
        "value_proposition": "string",
        "personas": [
            {{"name": "string", "role": "string", "goals": "string", "pain_points": "string"}},
            ...
        ],
        "business_model": {{
            "key_partners": ["string", ...],
            "value_propositions": "string",
            "revenue_streams": ["string", ...],
            "cost_structure": ["string", ...]
        }},
        "customer_journey": [
            {{"stage": "string", "action": "string", "feeling": "string"}},
            ...
        ],
        "roadmap": [
            {{"phase": "Phase 1: Title", "tasks": ["task 1", ...]}},
            ...
        ]
    }}
    """
    
    try:
        result = generate_with_rag(prompt, agent_name="product", business_type=business_type) or {}
        if not result or not isinstance(result, dict) or "usp" not in result:
            result = get_structured_fallback(f"Product Agent customer_journey for: {idea}")
    except Exception as e:
        logger.error(f"[product_agent] Error: {e}")
        result = get_structured_fallback(f"Product Agent customer_journey for: {idea}")

    if not result or not isinstance(result, dict) or "usp" not in result:
        result = get_structured_fallback(f"Product Agent customer_journey for: {idea}")
    
    step_entry = {
        "agent": "product",
        "status": "COMPLETED",
        "timestamp": datetime.utcnow().isoformat(),
        "summary": "Generated USP, mapped customer persona pain points, and designed the 4-phase rollout roadmap."
    }

    return {
        "product": result,
        "current_agent": "marketing",
        "workflow_steps": [step_entry]
    }
