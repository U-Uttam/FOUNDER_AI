from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class StartupCreate(BaseModel):
    idea: str = Field(..., description="The startup idea", examples=["I want to open a premium coffee shop in Anna Nagar, Chennai with ₹10 lakhs."])
    budget: float = Field(..., description="Startup budget (numeric)")
    location: str = Field(..., description="Startup location (e.g. Anna Nagar, Chennai)")

class StartupResponse(BaseModel):
    id: str
    idea: str
    budget: float
    location: str
    business_type: Optional[str] = None
    status: str
    current_agent: str
    workflow_steps: List[Dict[str, Any]]
    
    market_research: Optional[Dict[str, Any]] = None
    location_analysis: Optional[Dict[str, Any]] = None
    branding: Optional[Dict[str, Any]] = None
    finance: Optional[Dict[str, Any]] = None
    product: Optional[Dict[str, Any]] = None
    marketing: Optional[Dict[str, Any]] = None
    website: Optional[Dict[str, Any]] = None
    pitch_deck: Optional[Dict[str, Any]] = None
    compliance: Optional[Dict[str, Any]] = None
    errors: Optional[List[str]] = None
    
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LocationAnalyzeRequest(BaseModel):
    location: str
    business_type: str = "Coffee Shop"
    budget: float = 1000000.0
    radius: int = 1000  # meters: 500, 1000, 2000, 5000

class LocationAnalyzeResponse(BaseModel):
    location_name: str
    coords: Dict[str, float]
    counts: Dict[str, Any]
    metrics: Dict[str, Any]
    explanations: Optional[Dict[str, str]] = None
    competitors: List[Dict[str, Any]]
    colleges: List[Dict[str, Any]]
    offices: List[Dict[str, Any]]
    hospitals: List[Dict[str, Any]]
    metro_stations: List[Dict[str, Any]]
    shopping_malls: List[Dict[str, Any]]
    all_pois: Dict[str, List[Dict[str, Any]]]

class LocationCompareRequest(BaseModel):
    location1: str
    location2: str
    business_type: str
    budget: float
    radius: int = 1000

class LocationCompareResponse(BaseModel):
    location1_analysis: Dict[str, Any]
    location2_analysis: Dict[str, Any]
    recommendation: Dict[str, Any]

class LocationUpdateRequest(BaseModel):
    location: str

