import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import startup, location

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("founder_ai")

# Initialize Database tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
except Exception as e:
    logger.critical(f"Failed to initialize database tables: {e}")

# Auto-seed ChromaDB knowledge base for RAG retrieval
try:
    from .services.knowledge_loader import seed_knowledge
    seed_result = seed_knowledge()
    logger.info(f"RAG Knowledge Base: {seed_result.get('documents_loaded', 0)} documents seeded.")
except Exception as e:
    logger.warning(f"RAG knowledge seeding skipped: {e}")

app = FastAPI(
    title="FounderAI: Multi-Agent Startup Builder",
    description="Asynchronous startup planning & analysis engine orchestrated with LangGraph and Gemini.",
    version="1.0.0"
)

# CORS middleware for React app communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(startup.router)
app.include_router(location.router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "engine": "FastAPI + LangGraph"}

@app.get("/")
def root():
    return {
        "title": "FounderAI API",
        "description": "Autonomous startup generator backend active."
    }
