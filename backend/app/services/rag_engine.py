import logging
from typing import Optional
from .chroma import chroma_service
from .gemini import generate_json_with_gemini

logger = logging.getLogger("founder_ai")


def generate_with_rag(
    prompt: str,
    agent_name: str,
    business_type: str = "",
    location: str = "",
    model_name: str = "gemini-3.5-flash-lite"
) -> dict:
    """
    RAG-Augmented Generation Pipeline for FounderAI agents.

    This is the central intelligence function that replaces direct `generate_json_with_gemini()`
    calls in every agent. It implements the full RAG loop:

      1. RETRIEVE — Query ChromaDB for semantically similar past analyses & knowledge
      2. AUGMENT  — Inject retrieved context into the agent's prompt
      3. GENERATE — Call Gemini with the enriched prompt
      4. STORE    — Persist the new output back to ChromaDB for future retrieval

    The system becomes smarter with every startup plan it generates because each
    new output enriches the knowledge base for future RAG retrievals.

    Args:
        prompt: The agent's original prompt (unchanged from current implementation)
        agent_name: Which agent is calling (e.g., "research", "finance", "branding")
        business_type: The classified business type for this startup
        location: The target location
        model_name: Gemini model to use

    Returns:
        Parsed JSON dict from Gemini (same contract as generate_json_with_gemini)
    """

    # ─── Step 1: RETRIEVE — Search ChromaDB for similar context ───
    rag_context = ""
    try:
        search_query = f"{agent_name} analysis for {business_type} in {location}"
        rag_context = chroma_service.retrieve_similar_context(
            query=search_query,
            limit=3
        )
        if rag_context:
            logger.info(
                f"[RAG] Retrieved {len(rag_context.splitlines())} context lines "
                f"for {agent_name} ({business_type} in {location})"
            )
        else:
            logger.info(f"[RAG] No prior context found for {agent_name} ({business_type} in {location})")
    except Exception as e:
        logger.warning(f"[RAG] Retrieval failed for {agent_name}: {e}. Proceeding without RAG context.")
        rag_context = ""

    # ─── Step 2: AUGMENT — Inject retrieved knowledge into prompt ───
    if rag_context:
        augmented_prompt = f"""{prompt}

--- REFERENCE DATA FROM KNOWLEDGE BASE (RAG) ---
The following reference information was retrieved from our startup knowledge base and
past analyses of similar businesses. Use this data to provide more accurate, data-backed,
and contextually informed analysis. Prioritize your own reasoning but leverage these
references where they add value.

{rag_context}
--- END REFERENCE DATA ---
"""
    else:
        augmented_prompt = prompt

    # ─── Step 3: GENERATE — Call Gemini with enriched prompt ───
    result = generate_json_with_gemini(augmented_prompt, model_name=model_name)

    # ─── Step 4: STORE — Persist output for future RAG retrieval ───
    if result and isinstance(result, dict):
        try:
            import json
            from datetime import datetime

            doc_id = f"rag_{agent_name}_{datetime.utcnow().timestamp()}"
            doc_content = (
                f"Business: {business_type} | Location: {location} | "
                f"Agent: {agent_name} | "
                f"Output: {json.dumps(result, indent=None, default=str)[:1500]}"
            )
            chroma_service.add_knowledge(
                doc_id=doc_id,
                content=doc_content,
                metadata={
                    "source": f"rag_output_{agent_name}",
                    "business_type": business_type,
                    "location": location,
                    "agent_name": agent_name,
                    "generated_at": datetime.utcnow().isoformat()
                }
            )
            logger.info(f"[RAG] Stored output for {agent_name} ({business_type}) in knowledge base")
        except Exception as e:
            logger.warning(f"[RAG] Failed to store output for {agent_name}: {e}")

    return result
