from datetime import datetime
from .state import AgentState
from ..services.rag_engine import generate_with_rag
from ..services.gemini import get_structured_fallback
import logging

logger = logging.getLogger("founder_ai")

def marketing_agent(state: AgentState) -> AgentState:
    """
    Marketing Agent designs SEO keywords, campaign emails, and a 30-day social media plan.
    Uses the Business Intelligence Profile's primary_customer_segments to create hyper-targeted
    campaigns specific to the actual business type — not generic startup marketing copy.
    """
    idea = state.get("idea", "")
    business_type = state.get("business_type", "")
    location = state.get("location", "")
    company_name = (state.get("branding") or {}).get("company_name", "the startup")
    biz_profile = state.get("biz_profile") or {}
    customer_segments = biz_profile.get("primary_customer_segments", ["general public"])
    normalized_name = biz_profile.get("normalized_name", business_type)
    
    prompt = f"""
    You are the Marketing Agent. Create a highly targeted launch marketing kit for "{company_name}".
    Business Idea: "{idea}"
    Specific Business Type: "{normalized_name}"
    Primary Customer Segments (from AI analysis): {customer_segments}

    IMPORTANT: All marketing content must be specific to "{normalized_name}" and targeted to the
    exact customer segments listed above. Do NOT use generic startup marketing copy.
    
    Tasks:
    1. Propose 6-8 targeted SEO search Keywords.
    2. Write a detailed launch email campaign:
       - subject line
       - body copy (introducing the brand, the value prop, and a discount/launch offer)
    3. Provide an overall Marketing Strategy overview.
    4. Outline a 30-day marketing plan with 6 specific posts scheduled across Day 1, 5, 10, 15, 20, 30.
       Ensure that your schedule contains posts for:
       - Instagram (Day 1, Day 15)
       - Facebook (Day 5, Day 20)
       - LinkedIn (Day 10, Day 30)
       For each post generate:
       - day (number)
       - platform (Instagram, LinkedIn, or Facebook)
       - post_type (Reel, Article, Photo, Story, Carousel)
       - caption (full copy of the post, including hashtags and emojis, completely written without placeholders)
    
    Return a JSON object matching this structure:
    {{
        "seo_keywords": ["string", ...],
        "marketing_strategy": "string",
        "email_campaign": {{
            "subject": "string",
            "body": "string"
        }},
        "social_media_plan": [
            {{"day": int, "platform": "string", "post_type": "string", "caption": "string"}},
            ...
        ]
    }}
    """
    
    try:
        result = generate_with_rag(prompt, agent_name="marketing", business_type=business_type, location=location) or {}
        if not result or not isinstance(result, dict) or "seo_keywords" not in result:
            result = get_structured_fallback(f"Marketing Agent seo_keywords for: {idea}")
    except Exception as e:
        logger.error(f"[marketing_agent] Error: {e}")
        result = get_structured_fallback(f"Marketing Agent seo_keywords for: {idea}")

    if not result or not isinstance(result, dict) or "seo_keywords" not in result:
        result = get_structured_fallback(f"Marketing Agent seo_keywords for: {idea}")
    
    step_entry = {
        "agent": "marketing",
        "status": "COMPLETED",
        "timestamp": datetime.utcnow().isoformat(),
        "summary": f"Designed SEO keywords and a 30-day launch calendar with scheduled posts for Instagram and LinkedIn."
    }

    return {
        "marketing": result,
        "current_agent": "website",
        "workflow_steps": [step_entry]
    }
