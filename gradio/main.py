import os
import time
import asyncio
import gradio as gr
from typing import TypedDict
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END

with open("./keys/langsmith.txt", "r") as f:
    lkey = f.read().strip()

with open("./keys/api.txt", "r") as f:
    gkey = f.read().strip()

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
os.environ["LANGCHAIN_API_KEY"] = lkey
os.environ["LANGCHAIN_PROJECT"] = "Marketing Slack Sim"

credential_path = "./keys/cred.json"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credential_path

llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", GOOGLE_API_KEY=gkey)

PROMPTS = {
    "ceo": "You are a ruthless CEO who prioritizes maximizing profit while minimizing costs.",
    "marketing_intern": "You are a Marketing Intern with unpredictable ideas, sometimes genius, sometimes absurd.",
    "marketing_strategist": "You are a Marketing Strategist who critically analyzes marketing ideas for feasibility.",
}

class ConversationState(TypedDict):
    history: str
    start_time: float

def agent_node(role: str):
    async def node(state: ConversationState) -> ConversationState:
        if "history" not in state:
            state["history"] = ""
        
        messages = [
            SystemMessage(content=PROMPTS[role]),
            HumanMessage(content=state["history"]),
        ]
        response = await asyncio.to_thread(llm.invoke, messages)
        state["history"] += f"\n**{role.capitalize()}**: {response.content}\n"

        return state

    return node

def check_end(state: ConversationState) -> str:
    print(f"Checking end condition at {time.time() - state['start_time']} seconds")  # Debugging line
    if time.time() - state["start_time"] > 2:
        return END
    return "ceo"

builder = StateGraph(ConversationState)
builder.set_entry_point("ceo")
builder.add_node("ceo", agent_node("ceo"))
builder.add_node("marketing_intern", agent_node("marketing_intern"))
builder.add_node("marketing_strategist", agent_node("marketing_strategist"))
builder.add_edge("ceo", "marketing_intern")
builder.add_edge("marketing_intern", "marketing_strategist")
builder.add_conditional_edges("marketing_strategist", check_end)

graph = builder.compile()

async def run_conversation(product_description: str):
    state = {
        "history": f"**Product**: {product_description}\n",
        "start_time": time.time()
    }

    full_history = ""

    async for updated_state in graph.astream(state):
        for value in updated_state.values():
            if "history" in value.keys():
                full_history = value["history"]
        yield full_history

gr.Interface(
    fn=run_conversation,
    inputs=gr.Textbox(label="Enter Product Description"),
    outputs=gr.Textbox(label="Marketing Discussion", interactive=True),
    title="True Multi-Agent Marketing Simulation",
    description="A CEO, Marketing Intern, and Marketing Strategist interact dynamically to discuss marketing a product.",
    live=False  # Set this to False for batch updates
).launch(share=True)