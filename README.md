# FounderAI: An Autonomous Multi-Agent Startup Builder

FounderAI is a production-quality, co-founder intelligence platform designed to transform a raw startup idea into a comprehensive launch package. By utilizing **FastAPI**, **LangGraph (Gemini API)**, **ChromaDB**, **PostgreSQL / SQLite**, and **React (Vite + TypeScript + Tailwind CSS)**, the platform coordinates 11 dedicated agents to build a complete business plan, brand kit, website template, financial model, and pitch deck.

---

## 🚀 Key Features

* **Multi-Agent Orchestrator**: Uses a `StateGraph` in LangGraph to run 11 specialized planning agents sequentially.
* **Spatial Digital Twin Dashboard**: Analyzes demographics, competitor density, hospitals, colleges, offices, and metro links using the Google Maps API (with a premium vector map fallback).
* **Location Comparison Engine**: Performs side-by-side viability calculations for two target areas and issues data-backed recommendations.
* **Financial Allocations & Forecasts**: Employs Gemini to build capital allocation models, pricing systems, 3-year compound revenue projection charts, and 6-month cashflow sheets.
* **Website Customizer**: Automatically selects layout templates (Local Business, SaaS, E-commerce, Portfolio) and customizes fonts, copy, FAQs, and brand colors.
* **Pitch Deck Slides Player**: Formulates PowerPoint-ready slide layouts detailing Problem, Solution, Market size, GTM, and Investment Ask in a sleek presentation carousel.
* **Compliance Auditor**: Outlines regulatory guidelines (FSSAI, GST, Trade permits) based on the business type and local region.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite, TypeScript, Tailwind CSS, Lucide icons).
* **Backend**: FastAPI, Uvicorn, SQLAlchemy (ORM).
* **AI Orchestration**: LangGraph, Gemini API (`google-generativeai`).
* **Vector Store**: ChromaDB.
* **Database**: PostgreSQL (Fallback to SQLite: `founder_ai.db`).

---

## 📁 Directory Structure

```
FounderAI/
├── README.md
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   ├── run.py
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       ├── services/
│       │   ├── gemini.py
│       │   ├── maps.py
│       │   └── chroma.py
│       ├── agents/
│       │   ├── state.py
│       │   ├── graph.py
│       │   ├── founder.py
│       │   ├── research.py
│       │   ├── digital_twin.py
│       │   ├── branding.py
│       │   ├── product.py
│       │   ├── finance.py
│       │   ├── marketing.py
│       │   ├── website.py
│       │   ├── pitch_deck.py
│       │   └── project_manager.py
│       └── routers/
│           ├── startup.py
│           └── location.py
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── index.css
        ├── main.tsx
        ├── App.tsx
        ├── components/
        │   ├── Sidebar.tsx
        │   ├── DashboardOverview.tsx
        │   ├── MarketResearchView.tsx
        │   ├── DigitalTwinView.tsx
        │   ├── BrandingView.tsx
        │   ├── FinanceView.tsx
        │   ├── ProductRoadmapView.tsx
        │   ├── MarketingView.tsx
        │   ├── WebsitePreview.tsx
        │   ├── PitchDeckView.tsx
        │   └── ComplianceView.tsx
        ├── services/
        │   └── api.ts
        └── types/
            └── index.ts
```

---

## ⚙️ Setup & Installation Instructions

### 1. Prerequisites
* Python 3.10 or higher.
* Node.js v18 or higher.

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables. Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```
   * Set `GEMINI_API_KEY` for LLM capabilities.
   * Set `GOOGLE_MAPS_API_KEY` to retrieve real Google Map coordinates and locations (optional; mock fallback will activate if blank).
   * Leave `DATABASE_URL` commented out to default to the automatic SQLite fallback (`backend/founder_ai.db`).
5. Launch the FastAPI server:
   ```bash
   python run.py
   ```
   The backend server will run on `http://127.0.0.1:8000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open the browser link displayed (usually `http://localhost:5173`) to view the application dashboard.

---

## 📡 API Documentation & Endpoints

FastAPI generates automated OpenAPI docs. Once the backend is running, you can access the Swagger UI at `http://127.0.0.1:8000/docs`.

### Startup Builder Endpoints
* **`POST /api/startups/`**: Creates a new startup plan. Takes a pitch, location, and budget. Triggers the 11-agent LangGraph workflow in the background.
* **`GET /api/startups/`**: Retrieves a historical list of all generated startups.
* **`GET /api/startups/{id}`**: Returns the current status and real-time agent output blocks for a specific startup.

### Spatial Comparison Endpoints
* **`POST /api/location/compare`**: Runs a side-by-side viability study comparing two locations, returning competitor counts, estimated footfalls, projected revenues, and recommendations.
