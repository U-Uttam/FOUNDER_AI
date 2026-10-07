from langgraph.graph import StateGraph, END
from .state import AgentState
from .founder import founder_agent
from .research import research_agent
from .digital_twin import digital_twin_agent
from .branding import branding_agent
from .product import product_agent
from .finance import finance_agent
from .marketing import marketing_agent
from .compliance import compliance_agent
from .website import website_agent
from .pitch_deck import pitch_deck_agent
from .project_manager import project_manager_agent

# Initialize StateGraph
builder = StateGraph(AgentState)

# Add Nodes
builder.add_node("founder", founder_agent)
builder.add_node("research", research_agent)
builder.add_node("digital_twin", digital_twin_agent)
builder.add_node("branding", branding_agent)
builder.add_node("product", product_agent)
builder.add_node("finance", finance_agent)
builder.add_node("marketing", marketing_agent)
builder.add_node("compliance", compliance_agent)
builder.add_node("website", website_agent)
builder.add_node("pitch_deck", pitch_deck_agent)
builder.add_node("project_manager", project_manager_agent)

# Set Entry Point
builder.set_entry_point("founder")

# Sequential Multi-Agent Workflow:
# Each agent executes in a strict deterministic order so that downstream agents
# have complete context from previous agents, avoids simultaneous API quota bursts,
# and ensures project_manager runs ONLY AFTER all 9 deliverables are fully completed.
builder.add_edge("founder", "research")
builder.add_edge("research", "digital_twin")
builder.add_edge("digital_twin", "finance")
builder.add_edge("finance", "branding")
builder.add_edge("branding", "product")
builder.add_edge("product", "marketing")
builder.add_edge("marketing", "website")
builder.add_edge("website", "pitch_deck")
builder.add_edge("pitch_deck", "compliance")
builder.add_edge("compliance", "project_manager")
builder.add_edge("project_manager", END)

# Compile the LangGraph orchestrator workflow
workflow = builder.compile()
