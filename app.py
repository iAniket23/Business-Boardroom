import os
import random
import asyncio
from typing import TypedDict
from flask import Flask, request, jsonify
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END

# Load API keys
with open("./keys/langsmith.txt", "r") as f:
    lkey = f.read().strip()

with open("./keys/api.txt", "r") as f:
    gkey = f.read().strip()

# Set environment variables
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
os.environ["LANGCHAIN_API_KEY"] = lkey
os.environ["LANGCHAIN_PROJECT"] = "Marketing Slack Sim"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./keys/cred.json"

# Initialize model
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", GOOGLE_API_KEY=gkey)

# Role prompts
PROMPTS = {
    "ceo": "You are a ruthless CEO who prioritizes maximizing profit while minimizing costs. You are intelligent and smart. You make sure that everyone is on the same page. You are trying to impress the board of directors. You are very critical of the Marketing Intern's ideas but admire the bravery. You value the Marketing Strategist's inputs.",
    "marketing_intern": "You are a Marketing Intern with unpredictable ideas, sometimes genius, sometimes absurd. You are try to impress the CEO. You talk with a lot of enthusiasm. You do not shut down anyone else's ideas.",
    "marketing_strategist": "You are a Marketing Strategist who critically analyzes marketing ideas for feasibility. You are trying to impress the CEO. You want to see the product thrive. You are very critical of the Marketing Intern's ideas. You are very critical of your own ideas.",
}

class ConversationState(TypedDict):
    history: str
    current_agent: str
    turn_count: int
    init_count: int

# Agent node factory
def agent_node(role: str):
    async def node(state: ConversationState) -> ConversationState:
        messages = [
            SystemMessage(content=PROMPTS[role]),
            HumanMessage(content=state["history"]),
        ]
        response = await asyncio.to_thread(llm.invoke, messages)
        state["history"] += f"\n**{role.capitalize()}**: {response.content}\n"
        state["turn_count"] += 1
        state["current_agent"] = role
        return state
    return node

# Condition to end conversation
def check_end(state: ConversationState) -> str:
    if state["turn_count"] >= state["init_count"]:
        return END
    # Randomly select the next agent except the current one
    next_agents = ["ceo", "marketing_intern", "marketing_strategist"]
    next_agents.remove(state["current_agent"])
    next_agent = random.choice(next_agents)
    return next_agent

# Build the conversation graph
builder = StateGraph(ConversationState)
builder.set_entry_point("ceo")
builder.add_node("ceo", agent_node("ceo"))
builder.add_node("marketing_intern", agent_node("marketing_intern"))
builder.add_node("marketing_strategist", agent_node("marketing_strategist"))
builder.add_conditional_edges("ceo", check_end)
builder.add_conditional_edges("marketing_intern", check_end)
builder.add_conditional_edges("marketing_strategist", check_end)


graph = builder.compile()

# Async conversation runner
async def run_conversation(product_description: str, init_count: int):
    state: ConversationState = {
        "history": f"**Product**: {product_description}\n",
        "turn_count": 1,
        "init_count": init_count,
        "current_agent": "ceo",
    }

    full_history = ""

    async for updated_state in graph.astream(state):
        for value in updated_state.values():
            if "history" in value.keys():
                full_history = value["history"]
        yield full_history

# Sync wrapper for Flask
def start_conversation(product_description: str, init_count: int):
    async def collect_conversation():
        result = ""
        async for update in run_conversation(product_description, init_count):
            result = update
        return result
    return asyncio.run(collect_conversation())

# Flask App
app = Flask(__name__)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Welcome to the marketing chatbot API!"})

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    product_description = data.get("product_description", "").strip()
    init_count = data.get("init_count")

    if not product_description:
        return jsonify({"error": "Product description is required"}), 400

    try:
        init_count = int(init_count)
        if init_count <= 0:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({"error": "Initial count must be a positive integer"}), 400

    response = start_conversation(product_description, init_count)
    return jsonify({"response": response})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)