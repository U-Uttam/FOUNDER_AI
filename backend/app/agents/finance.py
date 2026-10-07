import logging
from datetime import datetime
from .state import AgentState
from ..services.rag_engine import generate_with_rag
from ..services.gemini import get_structured_fallback

logger = logging.getLogger("founder_ai")

def finance_agent(state: AgentState) -> AgentState:
    """
    Finance Agent constructs capital allocation models, pricing structures, revenue projections, 
    and cash flow forecasts based on the budget and location analytics.
    """
    idea = state.get("idea", "")
    business_type = state.get("business_type", "")
    budget = state.get("budget", 1000000.0)
    location = state.get("location", "")
    
    # Extract calculations from the Digital Twin agent
    location_analysis = state.get("location_analysis", {}) or {}
    metrics = location_analysis.get("metrics", {}) or {}
    footfall = metrics.get("estimated_footfall", 2000)
    est_monthly_rev = metrics.get("monthly_revenue_estimate", 180000)
    competitors_count = location_analysis.get("counts", {}).get("competitors", 4)
    avg_ticket = metrics.get("average_ticket_size", 150)
    daily_orders = metrics.get("daily_orders", 30)

    prompt = f"""
    You are the Finance Agent. Build a mathematically sound financial plan for a startup.
    Idea: "{idea}"
    Business Type: "{business_type}"
    Location: "{location}"
    Initial Capital Budget: ₹{budget:,.2f}
    
    Location Analytics Constraints (Use these for your calculations):
    - Primary Location: {location}
    - Estimated Daily Footfall: {footfall} people/day
    - Baseline Daily Orders (1.5% capture rate): {daily_orders} orders/day
    - Average Ticket Order Value: ₹{avg_ticket}
    - Local Direct Competitors: {competitors_count}
    - Calculated Spatial Monthly Revenue: ₹{est_monthly_rev:,.2f}
    
    Tasks:
    1. Distribute the budget of ₹{budget:,.2f} into 6 logical setup categories (e.g. Lease Advance, Equipment, Interiors, Working Capital, Licensing, Marketing). The sum of 'amount' fields must equal exactly ₹{budget}.
    2. Propose a Value-Based Pricing Strategy matching the local competition.
    3. Generate a 3-Year annual revenue forecast (Year 1, Year 2, Year 3). Year 1 revenue must be calculated as: daily orders ({daily_orders}) * average ticket (₹{avg_ticket}) * 365 (adjusted slightly for ramp-up, matching approximately ₹{est_monthly_rev * 12:,.2f}). Year 2 and Year 3 should project realistic, compound growth (15-30%).
    4. Calculate a monthly Break-even analysis:
       - monthly_fixed_costs (rent + salaries + utility)
       - average_order_value (must be equal to ₹{avg_ticket})
       - variable_cost_per_order (cost of goods sold, typically 30% of average_order_value)
       - Calculate monthly_orders_needed = monthly_fixed_costs / (average_order_value - variable_cost_per_order)
       - Calculate daily_orders_needed = monthly_orders_needed / 30
    5. Project an ROI percentage and Payback Period (in months) based on budget and Year 1-3 profits.
    6. Provide a detailed Expense Breakdown listing monthly operating items (Rent, Salaries, Ingredients/Materials, Utilities, Marketing, Insurance).
    7. Calculate Profit Estimation (margins, and annual net profits for Y1, Y2, Y3).
    8. Generate a 6-month Cash Flow forecast listing month (M1 to M6), inflow, outflow, and net cash flow. In M1, outflow must include the bulk of the initial capital spend ({budget}).
    
    Return a JSON object matching this structure:
    {{
        "budget_allocation": [
            {{"category": "string", "amount": float, "percentage": float}},
            ...
        ],
        "pricing_strategy": "string",
        "revenue_forecast": {{
            "year_1": float,
            "year_2": float,
            "year_3": float
        }},
        "break_even": {{
            "monthly_fixed_costs": float,
            "average_order_value": float,
            "variable_cost_per_order": float,
            "monthly_orders_needed": float,
            "daily_orders_needed": float
        }},
        "roi_percentage": float,
        "payback_period_months": float,
        "expense_analysis": {{
            "rent_monthly": float,
            "salaries_monthly": float,
            "ingredients_monthly": float,
            "marketing_utilities_monthly": float
        }},
        "expense_breakdown": [
            {{"item": "string", "monthly_cost": float}},
            ...
        ],
        "profit_estimation": {{
            "net_profit_margin_percentage": float,
            "annual_net_profit_y1": float,
            "annual_net_profit_y2": float,
            "annual_net_profit_y3": float
        }},
        "cash_flow": [
            {{"month": "M1", "inflow": float, "outflow": float, "net": float}},
            ...
        ]
    }}
    """
    
    try:
        result = generate_with_rag(prompt, agent_name="finance", business_type=business_type, location=location)
        if not result or not isinstance(result, dict) or "budget_allocation" not in result or "revenue_forecast" not in result:
            logger.warning("[finance_agent] Gemini returned empty/invalid result, using structured fallback.")
            result = get_structured_fallback(f"Finance Agent budget_allocation for: {idea} in {location} budget ₹{budget}")
    except Exception as e:
        logger.error(f"[finance_agent] Exception calling Gemini: {e}. Using structured fallback.")
        result = get_structured_fallback(f"Finance Agent budget_allocation for: {idea} in {location} budget ₹{budget}")

    if not result or not isinstance(result, dict):
        result = get_structured_fallback(f"Finance Agent budget_allocation for: {idea} in {location} budget ₹{budget}")

    # Ensure required sub-keys are present
    if "budget_allocation" not in result or not result["budget_allocation"]:
        fallback = get_structured_fallback(f"Finance Agent budget_allocation for: {idea} in {location} budget ₹{budget}")
        result["budget_allocation"] = fallback.get("budget_allocation", [])

    if "break_even" not in result:
        fallback = get_structured_fallback(f"Finance Agent budget_allocation for: {idea} in {location} budget ₹{budget}")
        result["break_even"] = fallback.get("break_even", {})

    if "revenue_forecast" not in result:
        fallback = get_structured_fallback(f"Finance Agent budget_allocation for: {idea} in {location} budget ₹{budget}")
        result["revenue_forecast"] = fallback.get("revenue_forecast", {})

    if "cash_flow" not in result:
        fallback = get_structured_fallback(f"Finance Agent budget_allocation for: {idea} in {location} budget ₹{budget}")
        result["cash_flow"] = fallback.get("cash_flow", [])

    # Ensure allocations sum to target budget
    allocs = result.get("budget_allocation", [])
    if allocs:
        total_alloc = sum(a.get("amount", 0.0) for a in allocs)
        if abs(total_alloc - budget) > 5.0 and len(allocs) > 0:
            diff = budget - total_alloc
            allocs[-1]["amount"] = round(allocs[-1].get("amount", 0.0) + diff, 2)
            for a in allocs:
                a["percentage"] = round((a.get("amount", 0.0) / budget) * 100, 1) if budget > 0 else 0.0

    step_entry = {
        "agent": "finance",
        "status": "COMPLETED",
        "timestamp": datetime.utcnow().isoformat(),
        "summary": f"Calculated budget allocation, pricing models, and projected ROI of {result.get('roi_percentage', 44.5)}%."
    }

    return {
        "finance": result,
        "current_agent": "branding",
        "workflow_steps": [step_entry]
    }

