from datetime import datetime
from .state import AgentState
from ..services.rag_engine import generate_with_rag
from ..services.gemini import get_structured_fallback
import logging

logger = logging.getLogger("founder_ai")

def compliance_agent(state: AgentState) -> AgentState:
    """
    Compliance Agent details corporate registrations, licenses, taxes, and timeline estimates.
    Uses the Business Intelligence Profile's compliance_category to ensure guidance is
    specific to the EXACT business type — not generic FSSAI/GST regardless of industry.
    """
    idea = state.get("idea", "")
    business_type = state.get("business_type", "")
    location = state.get("location", "")
    biz_profile = state.get("biz_profile") or {}
    compliance_category = biz_profile.get("compliance_category", "other")
    normalized_name = biz_profile.get("normalized_name", business_type)
    
    prompt = f"""
    You are the Compliance Agent. Provide PRECISE legal and regulatory compliance guidance for this startup.
    Business Idea: "{idea}"
    Specific Business Type: "{normalized_name}" (Compliance Category: {compliance_category})
    Location: "{location}" (Analyze specifically for this state/country region, e.g. Tamil Nadu / India if Chennai)

    IMPORTANT: Base your guidance on the SPECIFIC business type above.
    Examples of what to include by compliance_category:
    - food_and_beverage: FSSAI Registration/License, GSTIN, Municipal Trade License, Fire NOC, Health Trade License
    - automotive: Trade License, Pollution Control NOC, GST Registration, Workshop License, Fire Safety NOC
    - fitness: Trade License, GST, Fire NOC, Health Club Registration, AERB certification (if applicable)
    - beauty_salon: Trade License, GSTIN, Municipal Health License, Cosmetology License
    - pharmacy: Drug License (Form 20 & 21), GSTIN, Trade License, Narcotics License (if applicable)
    - pet_services: Trade License, GSTIN, Prevention of Cruelty to Animals compliance, Municipal Pet Shop License
    - retail: Trade License, GSTIN, Shop & Establishment Act registration, Import/Export code (if applicable)
    - technology: Company Registration (MCA), GSTIN, Software Export License (if applicable), DPDP Act compliance

    Identify 4-6 REQUIRED registrations, licenses, or compliance permits SPECIFIC TO THIS BUSINESS TYPE.
    For each provide:
    - name (the license name, e.g. FSSAI Registration, GSTIN, Municipal Health Trade License, Fire NOC)
    - type (Mandatory / Recommended / Optional)
    - description (what it covers and why it is needed)
    - cost_estimate (approximate fees in INR, e.g. "₹2,000 - ₹5,000")
    - time_estimate (typical processing timeline, e.g. "7 - 14 Days")
    - statutory_authority (e.g. "Food Safety and Standards Authority of India (FSSAI)", "Central Board of Indirect Taxes and Customs (CBIC)", "Ministry of Corporate Affairs (MCA)", "Municipal Corporation")
    - penalties_for_non_compliance (e.g. "Penalty up to ₹5,00,000 or up to 6 months imprisonment under FSSAI Act Sec 63")
    - prerequisites (array of required docs/steps, e.g. ["Rental Agreement", "Electricity Bill", "PAN Card"])
    - portal_url (e.g. "https://foscos.fssai.gov.in" or "https://www.gst.gov.in" or "https://www.mca.gov.in")
    - category_stage (one of: "pre_incorporation", "registration", "operational_license", "ongoing")
    
    Provide comprehensive additional guidance notes covering tax compliance, labor laws (PF/ESI if >10-20 employees), and regional municipal nuances.
    
    Return a JSON object matching this structure:
    {{
        "required_licenses": [
            {{
                "name": "string",
                "type": "string",
                "description": "string",
                "cost_estimate": "string",
                "time_estimate": "string",
                "statutory_authority": "string",
                "penalties_for_non_compliance": "string",
                "prerequisites": ["string", ...],
                "portal_url": "string",
                "category_stage": "pre_incorporation" | "registration" | "operational_license" | "ongoing"
            }},
            ...
        ],
        "additional_guidance": "string"
    }}
    """
    
    try:
        result = generate_with_rag(prompt, agent_name="compliance", business_type=business_type, location=location) or {}
        if not result or not isinstance(result, dict) or "required_licenses" not in result:
            result = get_structured_fallback(f"Compliance Agent required_licenses for: {idea} in {location}")
    except Exception as e:
        logger.error(f"[compliance_agent] Error: {e}")
        result = get_structured_fallback(f"Compliance Agent required_licenses for: {idea} in {location}")

    if not result or not isinstance(result, dict) or "required_licenses" not in result:
        result = get_structured_fallback(f"Compliance Agent required_licenses for: {idea} in {location}")
    
    step_entry = {
        "agent": "compliance",
        "status": "COMPLETED",
        "timestamp": datetime.utcnow().isoformat(),
        "summary": "Compiled regulatory checklist detailing GST registration, local trade permits, and industry certifications."
    }

    return {
        "compliance": result,
        "current_agent": "project_manager",
        "workflow_steps": [step_entry]
    }
