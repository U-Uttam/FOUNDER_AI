import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, JSON
from .database import Base

class Startup(Base):
    __tablename__ = "startups"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    idea = Column(String, nullable=False)
    budget = Column(Float, nullable=False)
    location = Column(String, nullable=False)
    business_type = Column(String, nullable=True)
    status = Column(String, default="PENDING")  # PENDING, PROCESSING, COMPLETED, FAILED
    current_agent = Column(String, default="founder")
    
    # Store workflow steps as a list of dictionaries: [{"agent": "founder", "status": "completed", "updated_at": "..."}]
    workflow_steps = Column(JSON, default=list)
    
    # Agent Outputs stored as JSON blobs
    market_research = Column(JSON, nullable=True)
    location_analysis = Column(JSON, nullable=True)
    branding = Column(JSON, nullable=True)
    finance = Column(JSON, nullable=True)
    product = Column(JSON, nullable=True)
    marketing = Column(JSON, nullable=True)
    website = Column(JSON, nullable=True)
    pitch_deck = Column(JSON, nullable=True)
    compliance = Column(JSON, nullable=True)
    errors = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
