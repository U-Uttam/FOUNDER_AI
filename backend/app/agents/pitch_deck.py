from datetime import datetime
from .state import AgentState
from ..services.rag_engine import generate_with_rag
from ..services.gemini import get_structured_fallback
import logging

logger = logging.getLogger("founder_ai")

def pitch_deck_agent(state: AgentState) -> AgentState:
    """
    Pitch Deck Agent synthesizes preceding intelligence inputs to produce a 9-slide investor presentation structure.
    """
    idea = state.get("idea", "")
    business_type = state.get("business_type", "")
    branding = state.get("branding") or {}
    company_name = branding.get("company_name", "the startup")
    tagline = branding.get("tagline", "")
    
    prompt = f"""
    You are the Pitch Deck Agent. Compose a highly persuasive 9-slide pitch deck for "{company_name}" ({tagline}).
    Idea: "{idea}"
    Business Type: "{business_type}"
    
    Produce slides in the exact sequence:
    1. Title Slide (Company Name, Tagline, Subtitle)
    2. Problem (What pain point does the target audience face?)
    3. Solution (How does "{company_name}" solve it?)
    4. Market Opportunity (What is the market size and demographics?)
    5. Business Model (How will the business make money?)
    6. Competition (Who are the competitors and what is the competitive edge?)
    7. Financial Highlights (Capital needed, projected revenues, ROI)
    8. Go-To-Market (How will you acquire users?)
    9. Investment Ask (How much money are you raising and how will you allocate it?)
    
    For each slide, provide:
    - title
    - bullets (3 concise, high-impact bullet points)
    
    Return a JSON object matching this structure:
    {{
        "slides": [
            {{"title": "slide title", "bullets": ["bullet 1", "bullet 2", "bullet 3"]}},
            ...
        ]
    }}
    """
    
    try:
        result = generate_with_rag(prompt, agent_name="pitch_deck", business_type=business_type) or {}
        if not result or not isinstance(result, dict) or "slides" not in result or len(result.get("slides", [])) == 0:
            logger.warning("[pitch_deck_agent] Gemini returned empty/invalid result, using structured fallback.")
            result = get_structured_fallback(
                f"Pitch Deck Agent slides investor presentation for: {idea}, company {company_name}"
            )
    except Exception as e:
        logger.error(f"[pitch_deck_agent] Exception calling Gemini: {e}. Using structured fallback.")
        result = get_structured_fallback(
            f"Pitch Deck Agent slides investor presentation for: {idea}, company {company_name}"
        )

    if not result or not isinstance(result, dict) or "slides" not in result or len(result.get("slides", [])) == 0:
        result = get_structured_fallback(
            f"Pitch Deck Agent slides investor presentation for: {idea}, company {company_name}"
        )

    step_entry = {
        "agent": "pitch_deck",
        "status": "COMPLETED",
        "timestamp": datetime.utcnow().isoformat(),
        "summary": f"Structured a 9-slide investor presentation detailing Problem, Solution, GTM, and Investment Ask."
    }

    return {
        "pitch_deck": result,
        "current_agent": "compliance",
        "workflow_steps": [step_entry]
    }
