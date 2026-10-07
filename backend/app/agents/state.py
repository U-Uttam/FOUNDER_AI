from typing import TypedDict, Optional, List, Dict, Any, Annotated
import operator

class AgentState(TypedDict):
    # Inputs
    idea: str
    budget: float
    location: str
    
    # Processed Meta
    business_type: Optional[str]
    current_agent: str
    biz_profile: Optional[Dict[str, Any]]  # Gemini Business Intelligence Profile — drives all agents
    
    # Core Outputs (populated step-by-step)
    market_research: Optional[Dict[str, Any]]
    location_analysis: Optional[Dict[str, Any]]
    branding: Optional[Dict[str, Any]]
    finance: Optional[Dict[str, Any]]
    product: Optional[Dict[str, Any]]
    marketing: Optional[Dict[str, Any]]
    website: Optional[Dict[str, Any]]
    pitch_deck: Optional[Dict[str, Any]]
    compliance: Optional[Dict[str, Any]]
    
    # Workflow logging
    workflow_steps: Annotated[List[Dict[str, Any]], operator.add]  # List of {"agent": str, "status": str, "timestamp": str}
    errors: Annotated[List[str], operator.add]
    
    # Final check flags
    project_manager_approved: Optional[bool]
    feedback_notes: Optional[str]

