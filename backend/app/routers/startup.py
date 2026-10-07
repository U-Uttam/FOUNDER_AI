import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Response
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db, SessionLocal
from .. import models, schemas
from ..agents import workflow
from ..services.chroma import chroma_service

logger = logging.getLogger("founder_ai")
router = APIRouter(prefix="/api/startups", tags=["startups"])

def run_agent_workflow(startup_id: str):
    """
    Background worker that runs the LangGraph multi-agent flow step-by-step
    and updates the database with each agent's findings.
    """
    db = SessionLocal()
    try:
        startup = db.query(models.Startup).filter(models.Startup.id == startup_id).first()
        if not startup:
            logger.error(f"Background worker: Startup {startup_id} not found in database.")
            return
            
        logger.info(f"Background worker: Launching workflow for startup '{startup_id}'")
        
        initial_state = {
            "idea": startup.idea,
            "budget": startup.budget,
            "location": startup.location,
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
        
        # Run the graph and stream each agent node execution
        # IMPORTANT: LangGraph can emit multiple parallel node outputs in a single event dict.
        # e.g., when branding → website AND branding → pitch_deck run simultaneously,
        # event = {"website": {...}, "pitch_deck": {...}}
        # We MUST iterate all keys — reading only [0] silently drops the other parallel outputs.
        for event in workflow.stream(initial_state):
            
            # Fetch latest DB state once per event
            db_startup = db.query(models.Startup).filter(models.Startup.id == startup_id).first()
            if not db_startup:
                logger.error(f"Startup {startup_id} deleted during processing.")
                break

            # Iterate ALL nodes present in this event (handles parallel branches correctly)
            for node_name, node_state in event.items():
                logger.info(f"Background worker: Completed agent '{node_name}' for startup '{startup_id}'")

                # Log standard status fields from any node that sets them
                if node_state.get("current_agent"):
                    db_startup.current_agent = node_state["current_agent"]
                if node_state.get("workflow_steps"):
                    existing = db_startup.workflow_steps or []
                    db_startup.workflow_steps = existing + node_state["workflow_steps"]

                # Save specific node outputs — ALL parallel nodes get persisted
                if node_name == "founder":
                    db_startup.business_type = node_state.get("business_type")
                elif node_name == "research":
                    db_startup.market_research = node_state.get("market_research")
                elif node_name == "digital_twin":
                    db_startup.location_analysis = node_state.get("location_analysis")
                elif node_name == "branding":
                    db_startup.branding = node_state.get("branding")
                elif node_name == "product":
                    db_startup.product = node_state.get("product")
                elif node_name == "finance":
                    db_startup.finance = node_state.get("finance")
                elif node_name == "marketing":
                    db_startup.marketing = node_state.get("marketing")
                elif node_name == "compliance":
                    db_startup.compliance = node_state.get("compliance")
                elif node_name == "website":
                    db_startup.website = node_state.get("website")
                elif node_name == "pitch_deck":
                    db_startup.pitch_deck = node_state.get("pitch_deck")
                elif node_name == "project_manager":
                    # Persist all cross-reconciled deliverables from Project Manager
                    if node_state.get("branding"):
                        db_startup.branding = node_state["branding"]
                    if node_state.get("finance"):
                        db_startup.finance = node_state["finance"]
                    if node_state.get("website"):
                        db_startup.website = node_state["website"]
                    if node_state.get("pitch_deck"):
                        db_startup.pitch_deck = node_state["pitch_deck"]
                    if node_state.get("product"):
                        db_startup.product = node_state["product"]
                    if node_state.get("marketing"):
                        db_startup.marketing = node_state["marketing"]
                    if node_state.get("compliance"):
                        db_startup.compliance = node_state["compliance"]
                    if node_state.get("market_research"):
                        db_startup.market_research = node_state["market_research"]
                    if node_state.get("location_analysis"):
                        db_startup.location_analysis = node_state["location_analysis"]

                    is_approved = node_state.get("project_manager_approved", False)
                    all_present = all([
                        db_startup.market_research,
                        db_startup.location_analysis,
                        db_startup.branding,
                        db_startup.product,
                        db_startup.finance,
                        db_startup.marketing,
                        db_startup.website,
                        db_startup.pitch_deck,
                        db_startup.compliance
                    ])
                    
                    if is_approved and all_present:
                        db_startup.status = "PENDING_APPROVAL"
                        # ──── RAG: Store completed plan in ChromaDB for future retrieval ────
                        try:
                            deliverables = {
                                "market_research": db_startup.market_research,
                                "location_analysis": db_startup.location_analysis,
                                "branding": db_startup.branding,
                                "finance": db_startup.finance,
                                "product": db_startup.product,
                                "marketing": db_startup.marketing,
                                "website": db_startup.website,
                                "pitch_deck": db_startup.pitch_deck,
                                "compliance": db_startup.compliance
                            }
                            chroma_service.store_plan(
                                startup_id=startup_id,
                                business_type=db_startup.business_type or "",
                                location=db_startup.location or "",
                                idea=db_startup.idea or "",
                                deliverables=deliverables
                            )
                            logger.info(f"RAG: Stored completed plan for startup '{startup_id}' in ChromaDB")
                        except Exception as rag_err:
                            logger.warning(f"RAG: Failed to store plan for '{startup_id}': {rag_err}")
                    elif not is_approved:
                        db_startup.status = "FAILED"
                        errs = node_state.get("errors", ["Project manager verification failed"])
                        db_startup.errors = (db_startup.errors or []) + errs

            db.commit()
            
    except Exception as e:
        logger.error(f"Error executing agent workflow for startup {startup_id}: {e}")
        db.rollback()
        db_startup = db.query(models.Startup).filter(models.Startup.id == startup_id).first()
        if db_startup:
            db_startup.status = "FAILED"
            current_errors = db_startup.errors or []
            db_startup.errors = current_errors + [str(e)]
            db.commit()
    finally:
        db.close()

def compile_markdown_report(startup: models.Startup, report_type: str) -> str:
    """
    Compiles a specific startup deliverable into a beautifully structured, comprehensive Markdown file.
    """
    company_name = (startup.branding or {}).get("company_name", "FounderAI Project")
    tagline = (startup.branding or {}).get("tagline", "Autonomous Startup Launch")
    
    if report_type == "business_plan":
        usp = (startup.product or {}).get("usp", "")
        val_prop = (startup.product or {}).get("value_proposition", "")
        m_res = startup.market_research or {}
        model = (startup.product or {}).get("business_model", {})
        
        return f"""# Business Plan for {company_name}
_{tagline}_

## 1. Executive Summary
* **Startup Idea**: {startup.idea}
* **Target Location**: {startup.location}
* **Capital Budget**: ₹{startup.budget:,.2f}
* **Core USP**: {usp}
* **Value Proposition**: {val_prop}

## 2. Market Research & Customer Analysis
* **Market Size**: {m_res.get('market_size', 'N/A')}
* **Projected Industry Growth**: {m_res.get('industry_growth', 'N/A')}
* **Competitor Summary**: {m_res.get('competitor_analysis', 'N/A')}
* **Target Demographic Profile**: {m_res.get('customer_analysis', 'N/A')}

## 3. SWOT Matrix Analysis
### Strengths (Internal)
{chr(10).join(f"- {s}" for s in m_res.get('swot', {}).get('strengths', []))}

### Weaknesses (Internal)
{chr(10).join(f"- {w}" for w in m_res.get('swot', {}).get('weaknesses', []))}

### Opportunities (External)
{chr(10).join(f"- {o}" for o in m_res.get('swot', {}).get('opportunities', []))}

### Threats (External)
{chr(10).join(f"- {t}" for t in m_res.get('swot', {}).get('threats', []))}

## 4. Growth Opportunities
{chr(10).join(f"- {g}" for g in m_res.get('growth_opportunities', []))}

## 5. Lean Business Model Canvas
* **Key Partners**: {", ".join(model.get('key_partners', []))}
* **Value Propositions**: {model.get('value_propositions', '')}
* **Revenue Streams**: {", ".join(model.get('revenue_streams', []))}
* **Cost Structure**: {", ".join(model.get('cost_structure', []))}
"""
    elif report_type == "financials":
        fin = startup.finance or {}
        break_even = fin.get("break_even", {})
        profits = fin.get("profit_estimation", {})
        expense = fin.get("expense_breakdown", [])
        
        expense_lines = "\n".join(f"- {e.get('item')}: ₹{e.get('monthly_cost'):,.2f}" for e in expense)
        budget_lines = "\n".join(f"- {b.get('category')}: ₹{b.get('amount'):,.2f} ({b.get('percentage')}%)" for b in fin.get("budget_allocation", []))
        cash_flow_lines = "\n".join(f"- {c.get('month')}: Inflow: ₹{c.get('inflow'):,.2f}, Outflow: ₹{c.get('outflow'):,.2f}, Net: ₹{c.get('net'):,.2f}" for c in fin.get("cash_flow", []))

        return f"""# Financial Plan & Report: {company_name}
_{tagline}_

## 1. Budget Capital Allocation
{budget_lines}

## 2. Expense Analysis (Monthly Overhead)
{expense_lines}

## 3. Projections & Break-Even Analysis
* **ROI Percentage**: {fin.get('roi_percentage')}%
* **Payback Period**: {fin.get('payback_period_months')} Months
* **Average Customer Bill**: ₹{break_even.get('average_order_value')}
* **Variable Product Cost**: ₹{break_even.get('variable_cost_per_order')}
* **Target Orders (Monthly)**: {break_even.get('monthly_orders_needed')} units
* **Daily Order Threshold**: {break_even.get('daily_orders_needed')} orders/day

## 4. Profit Margin Analysis
* **Net Profit Margin**: {profits.get('net_profit_margin_percentage')}%
* **Year 1 Net Profit**: ₹{profits.get('annual_net_profit_y1'):,.2f}
* **Year 2 Net Profit**: ₹{profits.get('annual_net_profit_y2'):,.2f}
* **Year 3 Net Profit**: ₹{profits.get('annual_net_profit_y3'):,.2f}

## 5. 6-Month Cash Flow Statement
{cash_flow_lines}
"""
    elif report_type == "marketing":
        mark = startup.marketing or {}
        email = mark.get("email_campaign", {})
        posts = "\n".join(f"- Day {p.get('day')} ({p.get('platform')} - {p.get('post_type')}):\n  * Caption: \"{p.get('caption')}\"\n" for p in mark.get("social_media_plan", []))
        
        return f"""# Go-To-Market Marketing Kit: {company_name}
_{tagline}_

## 1. Marketing Strategy Overview
{mark.get('marketing_strategy', '')}

## 2. Search Engine Optimization (SEO) Keywords
{", ".join(mark.get('seo_keywords', []))}

## 3. Email Campaign Copy
* **Subject**: {email.get('subject', '')}
* **Body**:
{email.get('body', '')}

## 4. 30-Day Social Media Post Planner
{posts}
"""
    elif report_type == "roadmap":
        prod = startup.product or {}
        road = prod.get("roadmap", [])
        journey = prod.get("customer_journey", [])
        
        road_lines = "\n".join(f"### {r.get('phase')}\n" + "\n".join(f"- {t}" for t in r.get('tasks', [])) for r in road)
        journey_lines = "\n".join(f"- {j.get('stage')}: Action: {j.get('action')}, Feeling: {j.get('feeling')}" for j in journey)

        return f"""# Project Roadmap & Customer Journey: {company_name}
_{tagline}_

## 1. Customer Journey Map
{journey_lines}

## 2. 4-Phase Rollout Plan
{road_lines}
"""
    elif report_type == "location":
        loc = startup.location_analysis or {}
        metrics = loc.get("metrics", {})
        exp = loc.get("explanations", {})
        
        return f"""# Spatial Location Viability Report: {startup.location}
_{tagline}_

## 1. Calculated Demographics & Scores
* **Business Potential Score**: {metrics.get('potential_score')}/100
  * _Why_: {exp.get('potential_score', '')}
* **Risk Score**: {metrics.get('risk_score')}/100
  * _Why_: {exp.get('risk_score', '')}
* **Competitor Density Score**: {metrics.get('competitor_density')}/100
  * _Why_: {exp.get('competitor_density', '')}
* **Infrastructure Score**: {metrics.get('infrastructure_score')}/100
  * _Why_: {exp.get('infrastructure_score', '')}
* **Accessibility Score**: {metrics.get('accessibility_score')}/100
  * _Why_: {exp.get('accessibility_score', '')}
* **Estimated Traffic (Daily)**: {metrics.get('estimated_footfall')} pedestrians/day
  * _Why_: {exp.get('footfall_estimate', '')}
* **Estimated Monthly Revenue Baseline**: ₹{metrics.get('monthly_revenue_estimate'):,.2f}
  * _Why_: {exp.get('revenue_estimate', '')}

## 2. Nearby Landmark Counts (1.5km Radius)
* **Competitors**: {loc.get('counts', {}).get('competitors', 0)}
* **Colleges**: {loc.get('counts', {}).get('colleges', 0)}
* **Offices**: {loc.get('counts', {}).get('offices', 0)}
* **Metro Stations**: {loc.get('counts', {}).get('metro_stations', 0)}
* **Bus Stops**: {loc.get('counts', {}).get('bus_stops', 0)}
* **Shopping Malls**: {loc.get('counts', {}).get('shopping_malls', 0)}
* **Hospitals**: {loc.get('counts', {}).get('hospitals', 0)}
* **Gyms**: {loc.get('counts', {}).get('gyms', 0)}
"""
    elif report_type == "compliance":
        comp = startup.compliance or {}
        lics = "\n".join(f"### [ ] {l.get('name')} ({l.get('type')})\n* **Description**: {l.get('description')}\n* **Cost**: {l.get('cost_estimate')}\n* **Time**: {l.get('time_estimate')}" for l in comp.get("required_licenses", []))

        return f"""# Legal Compliance & Licenses Playbook: {company_name}
_{tagline}_

## 1. Required Legal Registrations
{lics}

## 2. Additional Advisory Guidelines
{comp.get('additional_guidance', '')}
"""
    elif report_type == "pitch_deck":
        pitch_data = startup.pitch_deck or {}
        slides = pitch_data.get("slides", [])
        
        slide_text = "\n\n".join(f"--- \n### Slide {idx+1}: {s.get('title')}\n" + "\n".join(f"- {b}" for b in s.get('bullets', [])) for idx, s in enumerate(slides))
        
        return f"""# Investor Pitch Presentation: {company_name}
_{tagline}_

{slide_text}
"""
    else:
        return f"# Startup Deliverable Report: {company_name}"

@router.post("/", response_model=schemas.StartupResponse, status_code=201)
def create_startup(payload: schemas.StartupCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Creates a new startup record and initiates the LangGraph orchestrator as a background task.
    """
    new_startup = models.Startup(
        idea=payload.idea,
        budget=payload.budget,
        location=payload.location,
        status="PROCESSING",
        current_agent="founder",
        workflow_steps=[]
    )
    db.add(new_startup)
    db.commit()
    db.refresh(new_startup)
    
    # Enqueue background task
    background_tasks.add_task(run_agent_workflow, new_startup.id)
    
    return new_startup

@router.post("/{startup_id}/retry", response_model=schemas.StartupResponse)
def retry_startup(startup_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Retries a FAILED startup plan from scratch by resetting its status to PROCESSING
    and re-running the full LangGraph workflow. All prior partial outputs are preserved
    but the workflow re-executes from the beginning to ensure coherent output.
    """
    startup = db.query(models.Startup).filter(models.Startup.id == startup_id).first()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup analysis not found.")
    
    if startup.status == "PROCESSING":
        raise HTTPException(
            status_code=400,
            detail="Startup workflow is currently processing. Please wait for execution to complete."
        )
    
    # Reset the startup state for a clean retry
    startup.status = "PROCESSING"
    startup.current_agent = "founder"
    startup.errors = []
    startup.workflow_steps = []
    startup.business_type = None
    startup.market_research = None
    startup.location_analysis = None
    startup.branding = None
    startup.finance = None
    startup.product = None
    startup.marketing = None
    startup.website = None
    startup.pitch_deck = None
    startup.compliance = None
    db.commit()
    db.refresh(startup)
    
    # Re-enqueue background task
    background_tasks.add_task(run_agent_workflow, startup.id)
    
    return startup


@router.post("/{startup_id}/update-location", response_model=schemas.StartupResponse)
def update_startup_location(
    startup_id: str,
    payload: schemas.LocationUpdateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Updates the primary location of the startup, resets all previously computed agent data,
    and restarts the LangGraph background workflow from the beginning.
    """
    startup = db.query(models.Startup).filter(models.Startup.id == startup_id).first()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup analysis not found.")

    # Reset the startup state and update location
    startup.location = payload.location
    startup.status = "PROCESSING"
    startup.current_agent = "founder"
    startup.errors = []
    startup.workflow_steps = []
    startup.business_type = None
    startup.market_research = None
    startup.location_analysis = None
    startup.branding = None
    startup.finance = None
    startup.product = None
    startup.marketing = None
    startup.website = None
    startup.pitch_deck = None
    startup.compliance = None
    db.commit()
    db.refresh(startup)

    # Re-enqueue background task
    background_tasks.add_task(run_agent_workflow, startup.id)

    return startup



@router.post("/{startup_id}/approve", response_model=schemas.StartupResponse)
def approve_startup(startup_id: str, db: Session = Depends(get_db)):
    """
    Final approval check by user. Moves the startup status from PENDING_APPROVAL to COMPLETED.
    """
    startup = db.query(models.Startup).filter(models.Startup.id == startup_id).first()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup analysis not found.")
        
    if startup.status != "PENDING_APPROVAL":
        raise HTTPException(status_code=400, detail=f"Startup is not in PENDING_APPROVAL status. Current: {startup.status}")
        
    startup.status = "COMPLETED"
    db.commit()
    db.refresh(startup)
    
    return startup

@router.get("/{startup_id}/download/{report_type}")
def download_startup_report(startup_id: str, report_type: str, db: Session = Depends(get_db)):
    """
    Compiles and exports the requested startup planning document as a download file.
    """
    startup = db.query(models.Startup).filter(models.Startup.id == startup_id).first()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup analysis not found.")
        
    if report_type == "brand_kit":
        return download_brand_kit(startup_id, db=db)
        
    if startup.status != "COMPLETED":
        raise HTTPException(status_code=400, detail="Cannot download deliverables before the project manager package has been final approved by the user.")
        
    allowed_types = ["business_plan", "financials", "marketing", "roadmap", "location", "compliance", "pitch_deck"]
    if report_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Invalid report type. Allowed: {allowed_types}")

    company_name = (startup.branding or {}).get("company_name", "founderai")
    safe_name = company_name.lower().replace(" ", "_")
    filename = f"{safe_name}_{report_type}.md"
    
    report_content = compile_markdown_report(startup, report_type)
    
    return Response(
        content=report_content,
        media_type="text/markdown",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.get("/", response_model=List[schemas.StartupResponse])
def get_all_startups(db: Session = Depends(get_db)):
    """
    Retrieves all startup analysis proposals.
    """
    return db.query(models.Startup).order_by(models.Startup.created_at.desc()).all()

@router.get("/{startup_id}", response_model=schemas.StartupResponse)
def get_startup(startup_id: str, db: Session = Depends(get_db)):
    """
    Fetches details and real-time outputs of a specific startup builder package.
    """
    startup = db.query(models.Startup).filter(models.Startup.id == startup_id).first()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup analysis not found.")
    return startup

@router.delete("/{startup_id}")
def delete_startup(startup_id: str, db: Session = Depends(get_db)):
    """
    Deletes a startup analysis proposal from the database.
    """
    startup = db.query(models.Startup).filter(models.Startup.id == startup_id).first()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup analysis not found.")
    
    db.delete(startup)
    db.commit()
    return {"detail": "Startup proposal deleted successfully.", "id": startup_id}



from pydantic import BaseModel
import re

class GenerateLogoRequest(BaseModel):
    company_name: str
    business_type: str = ""
    idea: str = ""
    style: str = "luxury"

class SelectConceptRequest(BaseModel):
    concept_id: int

@router.post("/generate-logo-svg")
def generate_logo_svg_endpoint(req: GenerateLogoRequest):
    """
    Invokes Gemini AI brand intelligence and the vector Logo Engine
    to craft 3 personalized, editable SVG vector logo concepts.
    """
    from ..services.logo_engine import generate_3_concepts, extract_initials
    
    prompt = f"""
    You are an expert graphic designer and brand identity architect.
    Startup: "{req.company_name}"
    Business Type: "{req.business_type}"
    Idea: "{req.idea}"
    Style: "{req.style}"
    
    Recommend:
    1. Primary Hex Color, Secondary Hex Color, Accent Hex Color.
    2. Recommended Template: icon_wordmark | circular_emblem | monogram | badge | geometric_mark_wordmark | minimal_wordmark | modern_stacked | icon_above_text.
    3. Specific Icon Concept relevant to "{req.idea}".
    4. Tagline.
    
    Return JSON:
    {{
        "recommended_template": "...",
        "icon_concept": "...",
        "tagline": "...",
        "primary_color": "#HEX",
        "secondary_color": "#HEX",
        "accent_color": "#HEX"
    }}
    """
    design_spec = {}
    try:
        from ..services.gemini import generate_json_with_gemini
        gemini_res = generate_json_with_gemini(prompt)
        if isinstance(gemini_res, dict):
            design_spec = gemini_res
    except Exception as e:
        logger.warning(f"Gemini call in generate_logo_svg_endpoint: {e}")
        
    initials = extract_initials(req.company_name)
    brand_design = {
        "company_name": req.company_name,
        "brand_name": req.company_name,
        "tagline": design_spec.get("tagline") or f"Pioneering {req.business_type or 'Quality'}",
        "initials": initials,
        "business_category": req.business_type or req.idea or "Startup",
        "icon_concept": design_spec.get("icon_concept") or req.idea or req.business_type,
        "recommended_template": design_spec.get("recommended_template") or "icon_wordmark",
        "primary_color": design_spec.get("primary_color") or "#6366F1",
        "secondary_color": design_spec.get("secondary_color") or "#06B6D4",
        "accent_color": design_spec.get("accent_color") or "#F59E0B"
    }
    
    concepts = generate_3_concepts(brand_design)
    selected_svg = concepts[0]["svg"] if concepts else ""
    
    return {
        "logo_svg": selected_svg,
        "logo_concepts": concepts,
        "brand_design": brand_design
    }


@router.get("/{startup_id}/branding/asset")
def get_branding_asset(
    startup_id: str,
    format: str = "svg",
    concept: int = 0,
    transparent: bool = False,
    size: int = 1024,
    db: Session = Depends(get_db)
):
    """
    Exports a specific branding asset (svg, png, png_transparent, favicon_svg, favicon_png)
    for any generated concept.
    """
    startup = db.query(models.Startup).filter(models.Startup.id == startup_id).first()
    if not startup or not startup.branding:
        raise HTTPException(status_code=404, detail="Branding package not found for this startup.")
        
    from ..services.logo_engine import render_png, generate_3_concepts
    
    branding = startup.branding
    concepts = branding.get("logo_concepts") or []
    if not concepts:
        concepts = generate_3_concepts(branding)
        
    idx = max(0, min(concept, len(concepts) - 1)) if concepts else 0
    svg_code = concepts[idx]["svg"] if concepts else branding.get("logo_svg", "")
    
    company_name = branding.get("company_name", "startup")
    safe_name = re.sub(r'[^a-zA-Z0-9]', '_', company_name).lower()
    
    if format == "svg":
        return Response(
            content=svg_code,
            media_type="image/svg+xml",
            headers={"Content-Disposition": f"attachment; filename={safe_name}_concept_{idx+1}.svg"}
        )
    elif format in ("png", "png_transparent"):
        is_trans = transparent or (format == "png_transparent")
        png_bytes = render_png(svg_code, width=size, height=size, transparent=is_trans)
        if not png_bytes:
            raise HTTPException(status_code=500, detail="Failed to render PNG from vector SVG.")
        suffix = "_transparent" if is_trans else ""
        return Response(
            content=png_bytes,
            media_type="image/png",
            headers={"Content-Disposition": f"attachment; filename={safe_name}_concept_{idx+1}{suffix}.png"}
        )
    elif format == "favicon_svg":
        return Response(
            content=svg_code,
            media_type="image/svg+xml",
            headers={"Content-Disposition": f"attachment; filename={safe_name}_favicon.svg"}
        )
    elif format == "favicon_png":
        png_bytes = render_png(svg_code, width=512, height=512, transparent=False)
        if not png_bytes:
            raise HTTPException(status_code=500, detail="Failed to render Favicon PNG.")
        return Response(
            content=png_bytes,
            media_type="image/png",
            headers={"Content-Disposition": f"attachment; filename={safe_name}_favicon.png"}
        )
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{format}'. Supported: svg, png, png_transparent, favicon_svg, favicon_png."
        )


@router.get("/{startup_id}/download/brand_kit")
@router.get("/{startup_id}/branding/brand-kit.zip")
def download_brand_kit(
    startup_id: str,
    concept: int = 0,
    db: Session = Depends(get_db)
):
    """
    Downloads the comprehensive FounderAI_Brand_Kit.zip package containing
    SVG, HD PNG, Transparent PNG, Favicon, and brand identity metadata.
    """
    startup = db.query(models.Startup).filter(models.Startup.id == startup_id).first()
    if not startup or not startup.branding:
        raise HTTPException(status_code=404, detail="Branding package not found for this startup.")
        
    from ..services.logo_engine import generate_brand_kit_zip
    
    selected_concept = startup.branding.get("selected_logo_concept", concept)
    zip_bytes = generate_brand_kit_zip(startup.branding, selected_concept_id=selected_concept)
    
    company_name = startup.branding.get("company_name", "startup")
    safe_name = re.sub(r'[^a-zA-Z0-9]', '_', company_name).lower()
    
    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={safe_name}_Brand_Kit.zip",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )


@router.post("/{startup_id}/branding/select-concept")
def select_branding_concept(
    startup_id: str,
    req: SelectConceptRequest,
    db: Session = Depends(get_db)
):
    """
    Persists the user's selected logo concept to the startup branding profile.
    """
    startup = db.query(models.Startup).filter(models.Startup.id == startup_id).first()
    if not startup or not startup.branding:
        raise HTTPException(status_code=404, detail="Startup or branding not found.")
        
    branding = dict(startup.branding)
    concepts = branding.get("logo_concepts") or []
    if 0 <= req.concept_id < len(concepts):
        branding["selected_logo_concept"] = req.concept_id
        branding["logo_svg"] = concepts[req.concept_id]["svg"]
        startup.branding = branding
        db.commit()
        db.refresh(startup)
        
    return {"status": "success", "selected_concept": req.concept_id, "branding": startup.branding}


# ──────────────────────────────────────────────────────────────
# RAG Knowledge Management Endpoints
# ──────────────────────────────────────────────────────────────

@router.post("/admin/seed-knowledge")
def seed_knowledge_endpoint():
    """
    Seeds ChromaDB with curated startup knowledge for RAG retrieval.
    Safe to call multiple times — uses upsert.
    """
    from ..services.knowledge_loader import seed_knowledge
    result = seed_knowledge()
    return result


@router.get("/admin/knowledge-stats")
def knowledge_stats_endpoint():
    """
    Returns document counts for each ChromaDB collection.
    """
    return chroma_service.get_stats()


@router.get("/admin/search-knowledge")
def search_knowledge_endpoint(q: str, limit: int = 5):
    """
    Semantic search across the RAG knowledge base.
    Useful for debugging and demo purposes.
    """
    if not q.strip():
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required.")
    
    knowledge = chroma_service.search_knowledge(q, limit=limit)
    plans = chroma_service.search_past_plans(q, limit=limit)
    
    return {
        "query": q,
        "knowledge_results": knowledge,
        "past_plan_results": plans,
        "total_results": len(knowledge) + len(plans)
    }
