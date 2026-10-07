"""
FounderAI MCP Server — Model Context Protocol interface.

Exposes FounderAI's multi-agent startup analysis capabilities as standardized
MCP tools that any MCP-compatible AI client can call (Claude, Cursor, VS Code Copilot, etc.).

Architecture:
  - Runs as a standalone process alongside the FastAPI backend
  - Shares the same ChromaDB instance and service modules
  - Communicates via stdio (standard MCP transport)

Tools exposed:
  1. analyze_startup     — Full 11-agent pipeline
  2. market_research     — Research agent only
  3. financial_plan      — Finance agent only
  4. find_competitors    — OSM-based real competitor detection
  5. check_compliance    — Regulatory permits lookup
  6. search_knowledge    — RAG search across knowledge base
  7. compare_locations   — Side-by-side location viability
  8. generate_brand      — Brand identity generation

Usage:
  python mcp_server.py
  
MCP Configuration (add to your AI client's mcp_config.json):
  {
    "founderai": {
      "command": "python",
      "args": ["mcp_server.py"],
      "cwd": "<path-to-FounderAI>/backend"
    }
  }
"""

import sys
import os
import json
import logging
import asyncio

# Add the backend directory to Python path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("founder_ai_mcp")

try:
    from mcp.server import Server
    from mcp.server.stdio import stdio_server
    from mcp.types import Tool, TextContent, Resource
except ImportError:
    logger.error(
        "MCP SDK not installed. Install with: pip install mcp\n"
        "Then re-run: python mcp_server.py"
    )
    sys.exit(1)


# ──────────────────────────────────────────────────────────────
# Initialize FounderAI services
# ──────────────────────────────────────────────────────────────

from app.services.gemini import generate_json_with_gemini
from app.services.rag_engine import generate_with_rag
from app.services.chroma import chroma_service
from app.services.biz_profile import get_biz_profile
from app.services.maps import analyze_location_metrics, compare_locations
from app.services.knowledge_loader import seed_knowledge

# Seed knowledge on MCP server start
try:
    seed_result = seed_knowledge()
    logger.info(f"MCP: Knowledge seeded — {seed_result.get('documents_loaded', 0)} documents")
except Exception as e:
    logger.warning(f"MCP: Knowledge seeding skipped: {e}")


# ──────────────────────────────────────────────────────────────
# MCP Server Definition
# ──────────────────────────────────────────────────────────────

server = Server("founderai")


@server.list_tools()
async def list_tools():
    """Register all FounderAI tools with the MCP server."""
    return [
        Tool(
            name="analyze_startup",
            description=(
                "Run the full FounderAI 11-agent pipeline to analyze a startup idea. "
                "Generates: market research, location analysis, brand identity, financial plan, "
                "product roadmap, marketing kit, website template, pitch deck, and compliance checklist. "
                "Returns a comprehensive startup launch package."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "idea": {"type": "string", "description": "The startup idea (e.g., 'premium tea stall')"},
                    "budget": {"type": "number", "description": "Initial capital budget in INR"},
                    "location": {"type": "string", "description": "Target location (e.g., 'Katpadi, Vellore')"}
                },
                "required": ["idea", "budget", "location"]
            }
        ),
        Tool(
            name="market_research",
            description=(
                "Perform RAG-augmented market research for a startup idea. "
                "Returns: market size, SWOT analysis, competitor profiles, customer segments, "
                "industry trends, and growth opportunities."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "idea": {"type": "string", "description": "The startup idea"},
                    "business_type": {"type": "string", "description": "Specific business type classification"},
                    "location": {"type": "string", "description": "Target location"},
                    "budget": {"type": "number", "description": "Budget in INR", "default": 1000000}
                },
                "required": ["idea", "location"]
            }
        ),
        Tool(
            name="financial_plan",
            description=(
                "Generate a comprehensive financial plan including budget allocation, "
                "revenue forecasts, break-even analysis, ROI, cash flow projections, "
                "and expense breakdown."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "idea": {"type": "string", "description": "The startup idea"},
                    "business_type": {"type": "string", "description": "Business type"},
                    "location": {"type": "string", "description": "Target location"},
                    "budget": {"type": "number", "description": "Initial capital budget in INR"}
                },
                "required": ["idea", "budget", "location"]
            }
        ),
        Tool(
            name="find_competitors",
            description=(
                "Find real competitors near a location using OpenStreetMap Overpass API. "
                "Returns actual business names, coordinates, distances, and counts of "
                "competitors, colleges, offices, hospitals, and other POIs."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "Location to analyze"},
                    "business_type": {"type": "string", "description": "Type of business to find competitors for"},
                    "budget": {"type": "number", "description": "Budget for metrics calculation", "default": 1000000}
                },
                "required": ["location", "business_type"]
            }
        ),
        Tool(
            name="check_compliance",
            description=(
                "Get business-type-specific regulatory compliance requirements including "
                "required licenses, permits, costs, and timelines for Indian startups."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "idea": {"type": "string", "description": "The startup idea"},
                    "business_type": {"type": "string", "description": "Business type"},
                    "location": {"type": "string", "description": "Target location/state"}
                },
                "required": ["idea", "business_type", "location"]
            }
        ),
        Tool(
            name="search_knowledge",
            description=(
                "Search the FounderAI RAG knowledge base for startup-related information. "
                "Searches across seeded industry benchmarks, regulatory data, and past "
                "startup analyses."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"},
                    "limit": {"type": "integer", "description": "Max results to return", "default": 5}
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="compare_locations",
            description=(
                "Compare two locations side-by-side for a specific business type. "
                "Returns competitor counts, footfall estimates, revenue projections, "
                "and a data-backed recommendation for the better location."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "location1": {"type": "string", "description": "First location to compare"},
                    "location2": {"type": "string", "description": "Second location to compare"},
                    "business_type": {"type": "string", "description": "Business type for analysis"},
                    "budget": {"type": "number", "description": "Budget in INR", "default": 1000000}
                },
                "required": ["location1", "location2", "business_type"]
            }
        ),
        Tool(
            name="generate_brand",
            description=(
                "Generate a complete brand identity package including company name, "
                "tagline, brand story, color palette, typography, and SVG logo."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "idea": {"type": "string", "description": "The startup idea"},
                    "business_type": {"type": "string", "description": "Business type"}
                },
                "required": ["idea"]
            }
        ),
        Tool(
            name="generate_brand_logo",
            description=(
                "Generate 3 personalized, editable vector SVG logo concepts for a startup "
                "using the local SVG Logo Engine without external image APIs. "
                "Returns concepts, SVG code, and brand design specifications."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "startup_name": {"type": "string", "description": "Startup / brand name"},
                    "business_idea": {"type": "string", "description": "Startup idea description"},
                    "business_category": {"type": "string", "description": "Business category or domain"},
                    "location": {"type": "string", "description": "Target city/location", "default": "India"},
                    "brand_personality": {"type": "string", "description": "Personality traits (e.g., 'modern, premium')", "default": "modern, premium"}
                },
                "required": ["startup_name", "business_idea"]
            }
        ),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict):
    """Handle MCP tool calls by routing to the appropriate FounderAI service."""
    try:
        if name == "analyze_startup":
            result = await _run_full_pipeline(arguments)
        elif name == "market_research":
            result = await _run_market_research(arguments)
        elif name == "financial_plan":
            result = await _run_financial_plan(arguments)
        elif name == "find_competitors":
            result = await _run_find_competitors(arguments)
        elif name == "check_compliance":
            result = await _run_check_compliance(arguments)
        elif name == "search_knowledge":
            result = await _run_search_knowledge(arguments)
        elif name == "compare_locations":
            result = await _run_compare_locations(arguments)
        elif name == "generate_brand":
            result = await _run_generate_brand(arguments)
        elif name == "generate_brand_logo":
            result = await _run_generate_brand_logo(arguments)
        else:
            return [TextContent(type="text", text=f"Unknown tool: {name}")]

        return [TextContent(type="text", text=json.dumps(result, indent=2, default=str))]
    except Exception as e:
        logger.error(f"MCP tool '{name}' error: {e}")
        return [TextContent(type="text", text=json.dumps({"error": str(e)}))]


# ──────────────────────────────────────────────────────────────
# Tool Implementation Functions
# ──────────────────────────────────────────────────────────────

async def _run_full_pipeline(args: dict) -> dict:
    """Runs the full LangGraph 11-agent workflow synchronously."""
    from app.agents import workflow

    initial_state = {
        "idea": args["idea"],
        "budget": args["budget"],
        "location": args["location"],
        "business_type": None,
        "biz_profile": None,
        "current_agent": "founder",
        "market_research": None,
        "location_analysis": None,
        "branding": None,
        "finance": None,
        "product": None,
        "marketing": None,
        "website": None,
        "pitch_deck": None,
        "compliance": None,
        "workflow_steps": [],
        "errors": [],
        "project_manager_approved": None,
        "feedback_notes": None
    }

    # Run synchronously in a thread pool since LangGraph workflow is blocking
    loop = asyncio.get_event_loop()
    final_state = await loop.run_in_executor(None, lambda: _execute_workflow(workflow, initial_state))
    return final_state


def _execute_workflow(workflow, initial_state: dict) -> dict:
    """Execute the LangGraph workflow and collect final state."""
    result_state = dict(initial_state)
    for event in workflow.stream(initial_state):
        for node_name, node_state in event.items():
            result_state.update(node_state)

    # Store in ChromaDB for future RAG
    try:
        deliverables = {k: result_state.get(k) for k in [
            "market_research", "location_analysis", "branding", "finance",
            "product", "marketing", "website", "pitch_deck", "compliance"
        ]}
        chroma_service.store_plan(
            startup_id=f"mcp_{id(result_state)}",
            business_type=result_state.get("business_type", ""),
            location=result_state.get("location", ""),
            idea=result_state.get("idea", ""),
            deliverables=deliverables
        )
    except Exception as e:
        logger.warning(f"MCP: Failed to store plan in ChromaDB: {e}")

    # Remove non-serializable state keys
    for key in ["biz_profile", "workflow_steps", "errors", "project_manager_approved", "feedback_notes", "current_agent"]:
        result_state.pop(key, None)

    return result_state


async def _run_market_research(args: dict) -> dict:
    """Run the Research Agent only via RAG."""
    idea = args.get("idea", "")
    business_type = args.get("business_type", idea)
    location = args.get("location", "India")
    budget = args.get("budget", 1000000)

    prompt = f"""
    You are the Research Agent. Perform a comprehensive market research for a new startup.
    Idea: "{idea}" | Business Type: "{business_type}" | Location: "{location}" | Budget: ₹{budget}
    
    Return JSON with: market_size, industry_growth, competitor_analysis, competitors (list),
    customer_analysis, customer_segments, swot (strengths/weaknesses/opportunities/threats),
    industry_trends, growth_opportunities.
    """
    return generate_with_rag(prompt, agent_name="research", business_type=business_type, location=location)


async def _run_financial_plan(args: dict) -> dict:
    """Run the Finance Agent only via RAG."""
    idea = args.get("idea", "")
    business_type = args.get("business_type", idea)
    location = args.get("location", "India")
    budget = args.get("budget", 1000000)

    prompt = f"""
    You are the Finance Agent. Build a financial plan for: "{idea}"
    Business Type: "{business_type}" | Location: "{location}" | Budget: ₹{budget:,.2f}
    
    Return JSON with: budget_allocation, pricing_strategy, revenue_forecast (year_1/2/3),
    break_even, roi_percentage, payback_period_months, expense_breakdown, profit_estimation, cash_flow.
    """
    return generate_with_rag(prompt, agent_name="finance", business_type=business_type, location=location)


async def _run_find_competitors(args: dict) -> dict:
    """Find real competitors using OSM Overpass API."""
    location = args["location"]
    business_type = args["business_type"]
    budget = args.get("budget", 1000000)

    # Generate BIP for accurate OSM tag matching
    biz_profile = get_biz_profile(business_type, location)

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: analyze_location_metrics(location, business_type, budget, biz_profile=biz_profile)
    )
    return result


async def _run_check_compliance(args: dict) -> dict:
    """Run the Compliance Agent via RAG."""
    idea = args.get("idea", "")
    business_type = args.get("business_type", idea)
    location = args.get("location", "India")

    biz_profile = get_biz_profile(business_type, location)
    compliance_category = biz_profile.get("compliance_category", "other")

    prompt = f"""
    You are the Compliance Agent. Provide regulatory compliance guidance for:
    Business: "{business_type}" (Category: {compliance_category}) | Location: "{location}"
    
    Return JSON with: required_licenses (list of name/type/description/cost_estimate/time_estimate),
    additional_guidance.
    """
    return generate_with_rag(prompt, agent_name="compliance", business_type=business_type, location=location)


async def _run_search_knowledge(args: dict) -> dict:
    """Search the RAG knowledge base."""
    query = args["query"]
    limit = args.get("limit", 5)

    knowledge = chroma_service.search_knowledge(query, limit=limit)
    plans = chroma_service.search_past_plans(query, limit=limit)

    return {
        "query": query,
        "knowledge_results": knowledge,
        "past_plan_results": plans,
        "total_results": len(knowledge) + len(plans),
        "stats": chroma_service.get_stats()
    }


async def _run_compare_locations(args: dict) -> dict:
    """Compare two locations side-by-side."""
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: compare_locations(
            loc1=args["location1"],
            loc2=args["location2"],
            business_type=args["business_type"],
            budget=args.get("budget", 1000000)
        )
    )
    return result


async def _run_generate_brand(args: dict) -> dict:
    """Generate brand identity via RAG and Logo Engine."""
    idea = args.get("idea", "")
    business_type = args.get("business_type", idea)

    prompt = f"""
    You are the Branding Agent. Create a premium brand identity for: "{idea}"
    Business Type: "{business_type}"
    
    Return JSON with: company_name, tagline, brand_story, mission, vision,
    logo_prompt, brand_identity, brand_voice, brand_colors, typography.
    """
    res = generate_with_rag(prompt, agent_name="branding", business_type=business_type) or {}
    
    from app.services.logo_engine import generate_3_concepts, extract_initials
    company_name = res.get("company_name") or idea.title()
    brand_design = {
        "brand_name": company_name,
        "company_name": company_name,
        "tagline": res.get("tagline", f"Elevating {business_type}"),
        "initials": extract_initials(company_name),
        "business_category": business_type,
        "icon_concept": idea,
        "recommended_template": "icon_wordmark",
        "primary_color": (res.get("brand_colors", [{}])[0].get("hex") if res.get("brand_colors") else "#6366F1"),
        "secondary_color": "#06B6D4",
        "accent_color": "#F59E0B"
    }
    concepts = generate_3_concepts(brand_design)
    res["logo_concepts"] = concepts
    res["selected_logo_concept"] = 0
    res["logo_svg"] = concepts[0]["svg"] if concepts else ""
    return res


async def _run_generate_brand_logo(args: dict) -> dict:
    """Generate 3 personalized logo concepts and design package."""
    from app.services.logo_engine import generate_3_concepts, extract_initials

    name = args.get("startup_name", "Startup")
    idea = args.get("business_idea", "")
    category = args.get("business_category", idea)
    location = args.get("location", "India")
    personality_str = args.get("brand_personality", "modern, premium")
    personality = [p.strip() for p in personality_str.split(",") if p.strip()]

    brand_design = {
        "brand_name": name,
        "company_name": name,
        "tagline": f"Pioneering {category} in {location}",
        "initials": extract_initials(name),
        "business_category": category,
        "brand_personality": personality,
        "icon_concept": idea or category,
        "recommended_template": "icon_wordmark",
        "primary_color": "#6366F1",
        "secondary_color": "#06B6D4",
        "accent_color": "#F59E0B"
    }

    concepts = generate_3_concepts(brand_design)
    selected = concepts[0] if concepts else {}

    return {
        "concepts": concepts,
        "selected_logo": selected.get("name", ""),
        "svg": selected.get("svg", ""),
        "brand_design": brand_design
    }


# ──────────────────────────────────────────────────────────────
# MCP Resources
# ──────────────────────────────────────────────────────────────

@server.list_resources()
async def list_resources():
    """Expose ChromaDB knowledge base as browsable MCP resources."""
    stats = chroma_service.get_stats()
    return [
        Resource(
            uri="founderai://knowledge-base",
            name="Startup Knowledge Base",
            description=f"Curated startup reference data: {stats['knowledge_documents']} documents",
            mimeType="application/json"
        ),
        Resource(
            uri="founderai://past-plans",
            name="Past Startup Plans",
            description=f"Previously analyzed startup plans: {stats['past_plan_chunks']} chunks",
            mimeType="application/json"
        ),
    ]


@server.read_resource()
async def read_resource(uri: str):
    """Read MCP resource contents."""
    if uri == "founderai://knowledge-base":
        results = chroma_service.search_knowledge("startup business India", limit=20)
        return json.dumps(results, indent=2, default=str)
    elif uri == "founderai://past-plans":
        results = chroma_service.search_past_plans("startup plan", limit=20)
        return json.dumps(results, indent=2, default=str)
    else:
        return json.dumps({"error": f"Unknown resource: {uri}"})


# ──────────────────────────────────────────────────────────────
# Entry Point
# ──────────────────────────────────────────────────────────────

async def main():
    """Start the MCP server with stdio transport."""
    logger.info("Starting FounderAI MCP Server...")
    logger.info(f"Knowledge base: {chroma_service.get_stats()}")
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
