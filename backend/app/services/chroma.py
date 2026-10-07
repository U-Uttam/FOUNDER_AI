import os
import json
import logging
import chromadb
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger("founder_ai")


class ChromaService:
    """
    ChromaDB Vector Store service with two collections:
      - startup_knowledge: Seeded reference data (market facts, regulatory templates, benchmarks)
      - past_plans: Completed startup plan outputs for RAG retrieval

    This enables Retrieval-Augmented Generation (RAG): agents retrieve similar past
    analyses and knowledge before calling Gemini, producing richer, data-backed outputs.
    """

    def __init__(self):
        self.client = None
        self.knowledge_collection = None
        self.plans_collection = None

        try:
            backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            db_path = os.path.join(backend_dir, "chroma_db")
            os.makedirs(db_path, exist_ok=True)

            self.client = chromadb.PersistentClient(path=db_path)

            # Collection 1: Seeded startup knowledge (market data, regulations, benchmarks)
            self.knowledge_collection = self.client.get_or_create_collection(
                "startup_knowledge",
                metadata={"description": "Seeded reference knowledge for RAG retrieval"}
            )

            # Collection 2: Past completed startup plans
            self.plans_collection = self.client.get_or_create_collection(
                "past_plans",
                metadata={"description": "Completed startup plan outputs for contextual retrieval"}
            )

            logger.info(
                f"ChromaDB initialized at {db_path} | "
                f"knowledge: {self.knowledge_collection.count()} docs | "
                f"past_plans: {self.plans_collection.count()} docs"
            )
        except Exception as e:
            logger.error(f"ChromaDB persistent client failed: {e}. Falling back to in-memory.")
            try:
                self.client = chromadb.Client()
                self.knowledge_collection = self.client.get_or_create_collection("startup_knowledge")
                self.plans_collection = self.client.get_or_create_collection("past_plans")
            except Exception as inner_e:
                logger.critical(f"ChromaDB fallback failed: {inner_e}")

    # ──────────────────────────────────────────────────────────────
    # Knowledge Collection: Seeded reference data
    # ──────────────────────────────────────────────────────────────

    def add_knowledge(self, doc_id: str, content: str, metadata: Optional[Dict[str, Any]] = None):
        """
        Adds a knowledge document (market data, regulatory template, financial benchmark)
        to the startup_knowledge collection.
        """
        if not self.knowledge_collection:
            return
        try:
            self.knowledge_collection.upsert(
                documents=[content],
                metadatas=[metadata or {}],
                ids=[doc_id]
            )
            logger.info(f"Added/updated knowledge doc '{doc_id}' in ChromaDB")
        except Exception as e:
            logger.error(f"Error adding knowledge to ChromaDB: {e}")

    def search_knowledge(self, query: str, limit: int = 3) -> List[Dict[str, Any]]:
        """
        Semantic search across the startup_knowledge collection.
        Returns top-N matching documents with metadata.
        """
        if not self.knowledge_collection or self.knowledge_collection.count() == 0:
            return []
        try:
            results = self.knowledge_collection.query(
                query_texts=[query],
                n_results=min(limit, self.knowledge_collection.count())
            )
            return self._format_results(results)
        except Exception as e:
            logger.error(f"Error querying knowledge: {e}")
            return []

    # ──────────────────────────────────────────────────────────────
    # Past Plans Collection: Completed startup deliverables
    # ──────────────────────────────────────────────────────────────

    def store_plan(self, startup_id: str, business_type: str, location: str,
                   idea: str, deliverables: Dict[str, Any]):
        """
        Stores a completed startup plan's deliverables as chunked vector documents.
        Each agent's output becomes a separate searchable document so RAG retrieval
        can find specific, relevant sections (not one giant blob).
        """
        if not self.plans_collection:
            return

        timestamp = datetime.utcnow().isoformat()
        base_metadata = {
            "startup_id": startup_id,
            "business_type": business_type,
            "location": location,
            "idea": idea,
            "stored_at": timestamp
        }

        chunks = self._chunk_deliverables(deliverables, business_type, location, idea)

        for chunk_id, chunk_text, chunk_meta in chunks:
            doc_id = f"{startup_id}_{chunk_id}"
            merged_meta = {**base_metadata, **chunk_meta}
            try:
                self.plans_collection.upsert(
                    documents=[chunk_text],
                    metadatas=[merged_meta],
                    ids=[doc_id]
                )
            except Exception as e:
                logger.error(f"Error storing plan chunk '{doc_id}': {e}")

        logger.info(
            f"Stored {len(chunks)} plan chunks for startup '{startup_id}' "
            f"({business_type} in {location})"
        )

    def search_past_plans(self, query: str, limit: int = 3) -> List[Dict[str, Any]]:
        """
        Semantic search across past completed startup plans.
        Returns top-N matching plan chunks with metadata.
        """
        if not self.plans_collection or self.plans_collection.count() == 0:
            return []
        try:
            results = self.plans_collection.query(
                query_texts=[query],
                n_results=min(limit, self.plans_collection.count())
            )
            return self._format_results(results)
        except Exception as e:
            logger.error(f"Error querying past plans: {e}")
            return []

    # ──────────────────────────────────────────────────────────────
    # Unified RAG Retrieval: Searches BOTH collections
    # ──────────────────────────────────────────────────────────────

    def retrieve_similar_context(self, query: str, limit: int = 3) -> str:
        """
        Retrieves similar context from BOTH collections (knowledge + past plans)
        and formats it as a reference block that can be injected into agent prompts.

        Returns a formatted string ready for prompt augmentation, or empty string if nothing found.
        """
        knowledge_results = self.search_knowledge(query, limit=limit)
        plan_results = self.search_past_plans(query, limit=limit)

        if not knowledge_results and not plan_results:
            return ""

        context_parts = []

        if knowledge_results:
            context_parts.append("=== REFERENCE KNOWLEDGE (from startup knowledge base) ===")
            for i, doc in enumerate(knowledge_results, 1):
                source = doc.get("metadata", {}).get("source", "knowledge_base")
                context_parts.append(f"[Ref {i} — {source}]: {doc['document'][:500]}")

        if plan_results:
            context_parts.append("\n=== SIMILAR PAST STARTUP ANALYSES ===")
            for i, doc in enumerate(plan_results, 1):
                meta = doc.get("metadata", {})
                biz = meta.get("business_type", "unknown")
                loc = meta.get("location", "unknown")
                agent = meta.get("agent_name", "unknown")
                context_parts.append(
                    f"[Past Plan {i} — {biz} in {loc}, agent: {agent}]: {doc['document'][:500]}"
                )

        return "\n".join(context_parts)

    # ──────────────────────────────────────────────────────────────
    # Stats & Admin
    # ──────────────────────────────────────────────────────────────

    def get_stats(self) -> Dict[str, int]:
        """Returns document counts for each collection."""
        return {
            "knowledge_documents": self.knowledge_collection.count() if self.knowledge_collection else 0,
            "past_plan_chunks": self.plans_collection.count() if self.plans_collection else 0
        }

    def clear_all(self):
        """Clears both collections. Use for testing only."""
        if self.client:
            try:
                self.client.delete_collection("startup_knowledge")
                self.client.delete_collection("past_plans")
                self.knowledge_collection = self.client.get_or_create_collection("startup_knowledge")
                self.plans_collection = self.client.get_or_create_collection("past_plans")
                logger.info("All ChromaDB collections cleared.")
            except Exception as e:
                logger.error(f"Error clearing collections: {e}")

    # ──────────────────────────────────────────────────────────────
    # Internal Helpers
    # ──────────────────────────────────────────────────────────────

    def _chunk_deliverables(self, deliverables: Dict[str, Any],
                            business_type: str, location: str, idea: str
                            ) -> List[tuple]:
        """
        Breaks a startup's deliverables into separate chunks — one per agent output.
        Each chunk is a (chunk_id, text_content, metadata) tuple.
        """
        chunks = []

        agent_blocks = {
            "market_research": "Research Agent — market analysis, SWOT, competitors, customer segments",
            "location_analysis": "Digital Twin Agent — geospatial location viability, POI counts, scores",
            "branding": "Branding Agent — company name, tagline, brand identity, logo, colors",
            "finance": "Finance Agent — budget allocation, revenue forecast, break-even, cash flow",
            "product": "Product Agent — USP, personas, lean canvas, customer journey, roadmap",
            "marketing": "Marketing Agent — SEO keywords, email campaign, social media plan",
            "website": "Website Agent — landing page config, template, hero, services, FAQs",
            "pitch_deck": "Pitch Deck Agent — 9-slide investor presentation",
            "compliance": "Compliance Agent — regulatory licenses, permits, costs, timelines"
        }

        for agent_key, agent_desc in agent_blocks.items():
            data = deliverables.get(agent_key)
            if not data or not isinstance(data, dict):
                continue

            # Create a readable text summary of this agent's output
            text = f"Business: {business_type} | Location: {location} | Idea: {idea}\n"
            text += f"Agent: {agent_desc}\n"
            text += f"Output: {json.dumps(data, indent=None, default=str)[:1500]}"

            chunks.append((
                agent_key,
                text,
                {"agent_name": agent_key, "agent_description": agent_desc}
            ))

        return chunks

    def _format_results(self, results: Any) -> List[Dict[str, Any]]:
        """Formats raw ChromaDB query results into a clean list of dicts."""
        formatted = []
        if results and results.get("documents"):
            documents = results["documents"][0]
            metadatas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(documents)
            ids = results["ids"][0]
            distances = results["distances"][0] if results.get("distances") else [None] * len(documents)

            for idx, doc in enumerate(documents):
                formatted.append({
                    "id": ids[idx],
                    "document": doc,
                    "metadata": metadatas[idx],
                    "distance": distances[idx]
                })
        return formatted


# Instantiate singleton
chroma_service = ChromaService()
