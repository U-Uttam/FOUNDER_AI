from datetime import datetime
from .state import AgentState
from ..services.rag_engine import generate_with_rag
from ..services.chroma import chroma_service

def research_agent(state: AgentState) -> AgentState:
    """
    Research Agent performs SWOT analysis, competitor studies, and parses industry trends.
    Uses RAG pipeline to retrieve similar past analyses before generating new research.
    Persists findings into ChromaDB for future retrieval.
    """
    idea = state.get("idea", "")
    business_type = state.get("business_type", "")
    location = state.get("location", "")
    budget = state.get("budget", 0)
    biz_profile = state.get("biz_profile") or {}
    
    verified_competitors = biz_profile.get("competitors_detailed")
    if not verified_competitors and location and business_type:
        try:
            from ..services.competitor_intel import discover_hyperlocal_competitors
            comp_intel = discover_hyperlocal_competitors(business_type, location)
            verified_competitors = comp_intel.get("competitors", [])
        except Exception:
            verified_competitors = []

    comp_evidence = ""
    if verified_competitors:
        comp_evidence = "\n\nVERIFIED PHYSICAL COMPETITORS IN THIS MICRO-LOCATION:\n" + "\n".join(
            f"- {c['name']} | Area: {c.get('address')} | Tier: {c.get('category_tier', 'Local Specialist')} | Strength: {c.get('strength', 'Local footfall')} | Weakness: {c.get('weakness', 'Digital presence')}"
            for c in verified_competitors[:12]
        )
    
    prompt = f"""
    You are the Research Agent. Perform a comprehensive market research for a new startup.
    Idea: "{idea}"
    Business Type: "{business_type}"
    Location: "{location}"
    Budget: ₹{budget}
    {comp_evidence}
    
    Provide:
    1. Estimated Market Size in India or hyper-locally in {location}.
    2. Projected Industry Growth rate (CAGR).
    3. Profile of 8 to 12 REAL local competitors physically operating in "{location}" for this business type (Name, Strengths, Weaknesses).
       (CRITICAL BOUNDARY RULE: Strictly use and analyze the verified competitors operating in "{location}". DO NOT list distant city-center flagships that do not have physical stores in "{location}". For example, if "{location}" is Katpadi, strictly DO NOT list Pothys or RMKV from Vellore Anna Salai across the river).
    4. Competitor Analysis summary (a detailed report paragraph describing competitor saturation, local corridor pricing, and market positioning).
    5. 3 primary target Customer Segments and their respective pain points.
    6. Customer Analysis overview (demographic traits and buying behavior summary).
    7. A comprehensive SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats) containing 3-4 bullet points per section.
    8. 3 key modern Industry Trends relevant to this sector.
    9. 3 key Growth Opportunities for a newcomer in this market.
    
    Return a JSON object matching this structure:
    {{
        "market_size": "string",
        "industry_growth": "string",
        "competitor_analysis": "string",
        "competitors": [
            {{"name": "competitor name", "strength": "string", "weakness": "string"}}
        ],
        "customer_analysis": "string",
        "customer_segments": [
            {{"segment": "segment name", "needs": "string"}}
        ],
        "swot": {{
            "strengths": ["string"],
            "weaknesses": ["string"],
            "opportunities": ["string"],
            "threats": ["string"]
        }},
        "industry_trends": ["string"],
        "growth_opportunities": ["string"]
    }}
    """
    
    # Use RAG engine: retrieves similar past research, augments prompt, generates, stores output
    result = generate_with_rag(
        prompt=prompt,
        agent_name="research",
        business_type=business_type,
        location=location
    )

    # Ensure verified competitors are preserved and prioritized in final market research deliverable
    if verified_competitors:
        res_comps = result.get("competitors", [])
        res_names = {c.get("name", "").strip().lower() for c in res_comps}
        merged_comps = []
        # Add verified competitors first
        for vc in verified_competitors:
            merged_comps.append({
                "name": vc["name"],
                "strength": vc.get("strength") or "Established physical footprint and brand recognition in this micro-market",
                "weakness": vc.get("weakness") or "Higher overheads and limited personalized digital experience"
            })
        # Append any additional non-duplicate competitors from LLM analysis
        for rc in res_comps:
            rc_name = rc.get("name", "").strip()
            if rc_name and rc_name.lower() not in {m["name"].lower() for m in merged_comps}:
                merged_comps.append(rc)
        result["competitors"] = merged_comps[:14]

    # Normalize result fields to ensure clean string primitives
    def _extract_clean_str(val):
        if isinstance(val, str):
            return val.strip()
        if isinstance(val, dict):
            return str(val.get("opportunity") or val.get("trend") or val.get("point") or val.get("text") or val.get("title") or next(iter(val.values()), "")).strip()
        return str(val).strip() if val is not None else ""

    if "growth_opportunities" in result and isinstance(result["growth_opportunities"], list):
        result["growth_opportunities"] = [_extract_clean_str(x) for x in result["growth_opportunities"] if _extract_clean_str(x)]

    if "industry_trends" in result and isinstance(result["industry_trends"], list):
        result["industry_trends"] = [_extract_clean_str(x) for x in result["industry_trends"] if _extract_clean_str(x)]

    if "swot" in result and isinstance(result["swot"], dict):
        for k in ["strengths", "weaknesses", "opportunities", "threats"]:
            if k in result["swot"] and isinstance(result["swot"][k], list):
                result["swot"][k] = [_extract_clean_str(x) for x in result["swot"][k] if _extract_clean_str(x)]
    
    # Store output in state
    state["market_research"] = result
    state["current_agent"] = "digital_twin"
    
    # Also persist structured summary in ChromaDB for richer future retrieval
    doc_id = f"research_{datetime.utcnow().timestamp()}"
    doc_content = f"Business Type: {business_type}. Location: {location}. SWOT: {result.get('swot')}. Market Size: {result.get('market_size')}"
    chroma_service.add_knowledge(
        doc_id=doc_id,
        content=doc_content,
        metadata={"source": "research_agent", "business_type": business_type, "location": location}
    )
    
    # Track workflow step
    step_entry = {
        "agent": "research",
        "status": "COMPLETED",
        "timestamp": datetime.utcnow().isoformat(),
        "summary": "Completed RAG-augmented market size calculations, target segments profiling, and SWOT matrix generation."
    }
    return {
        "market_research": result,
        "current_agent": "digital_twin",
        "workflow_steps": [step_entry]
    }
