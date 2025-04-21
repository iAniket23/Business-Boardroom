import os
import re
import random
import asyncio
import requests
import threading
from flask_cors import CORS
from typing import TypedDict
from flask import Flask, request, jsonify
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END

# Load API keys
with open("langsmith.txt", "r") as f:
    lkey = f.read().strip()

with open("api.txt", "r") as f:
    gkey = f.read().strip()

with open("slackclient.txt", "r") as f:
    slack_token = f.read().strip()

with open("slackclientsecret.txt", "r") as f:
    slack_client_secret = f.read().strip()

# Set environment variables
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
os.environ["LANGCHAIN_API_KEY"] = lkey
os.environ["LANGCHAIN_PROJECT"] = "Marketing Slack Sim"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "cred.json"

# Initialize model
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", GOOGLE_API_KEY=gkey)

# Role prompts
PROMPTS = {
    "ceo": "You are a ruthless CEO who prioritizes maximizing profit while minimizing costs. You are intelligent and smart.",
    "marketing_intern": "You are a Marketing Intern with unpredictable ideas, sometimes genius, sometimes absurd. You talk with a lot of enthusiasm. You do not shut down anyone else's ideas.",
    "marketing_strategist": "You are a Marketing Strategist who critically analyzes marketing ideas for feasibility. You want to see the product thrive. You love to give constructive criticism.",
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
        "turn_count": 0,
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

def format_conversation_for_html(convo: str) -> str:
    role_emojis = {
        "product": "📦",
        "ceo": "👔",
        "marketing_intern": "🧃",
        "marketing_strategist": "📊"
    }

    output = []
    output.append("<strong>🧠 Marketing Brainstorm Session</strong><br><br>")

    pattern = re.compile(r"\*\*(\w+)\*\*: (.*)", re.IGNORECASE)
    current_role = None

    for paragraph in convo.strip().split("\n\n"):
        match = pattern.match(paragraph.strip())

        if match:
            current_role = match.group(1).lower()
            message = match.group(2).strip()

            # Replace markdown-style **bold** inside message with <strong>
            message = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", message)

            emoji = role_emojis.get(current_role, "💬")
            role_display = match.group(1).replace("_", " ").title()

            output.append(f"{emoji} <strong>{role_display}</strong>: {message}<br><br>")
        else:
            if current_role:
                paragraph = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", paragraph)
                output.append(f"&nbsp;&nbsp;&nbsp;{paragraph.strip()}<br><br>")
            else:
                paragraph = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", paragraph)
                output.append(f"{paragraph.strip()}<br><br>")

    return "".join(output)

def format_conversation_for_slack(convo: str) -> str:
    role_emojis = {
        "product": "📦",
        "ceo": "\n👔",
        "marketing_intern": "\n🧃",
        "marketing_strategist": "\n📊"
    }

    output = []
    output.append("*🧠 Marketing Brainstorm Session*")

    pattern = re.compile(r"\*\*(\w+)\*\*: (.*)", re.IGNORECASE)
    current_role = None

    for paragraph in convo.strip().split("\n\n"):
        match = pattern.match(paragraph.strip())

        if match:
            current_role = match.group(1).lower()
            message = match.group(2).strip()

            emoji = role_emojis.get(current_role, "💬")
            role_display = match.group(1).replace("_", " ").title()

            output.append(f"{emoji} *{role_display}*: {message}")
        else:
            if current_role:
                output.append(f"  {paragraph.strip()}")
            else:
                output.append(paragraph.strip())
    slack_friendly = "\n".join(output)
    slack_friendly = re.sub(r"\*\*(.*?)\*\*", r"*\1*", slack_friendly)
    return slack_friendly

# Flask App
app = Flask(__name__)
CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Welcome to the marketing chatbot API!"})

@app.route("/slack/oauth_redirect")
def oauth_redirect():
    code = request.args.get("code")
    client_id = slack_token
    client_secret = slack_client_secret

    response = requests.post("https://slack.com/api/oauth.v2.access", data={
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": "https://boardroom-197814739607.us-central1.run.app/slack/oauth_redirect"
    })

    data = response.json()
    if data.get("ok"):
        # Store access_token and other info as needed
        return "App installed successfully!"
    else:
        return f"Error installing app: {data.get('error')}"

@app.route("/slack", methods=["POST"])
def slack_command():
    text = request.form.get("text", "")
    user = request.form.get("user_name", "someone")
    response_url = request.form.get("response_url")

    if not text:
        return jsonify({
            "response_type": "ephemeral",
            "text": "Please provide: init_count and product_description"
        }), 200

    try:
        parts = text.strip().split(" ", 1)
        init_count = int(parts[0])
        product_description = parts[1]
    except (IndexError, ValueError):
        return jsonify({
            "response_type": "ephemeral",
            "text": "Invalid format.\nUsage: `/simulate 5 AI-powered toothbrush`"
        }), 200

    def background_sim():
        result = start_conversation(product_description, init_count)
        result = format_conversation_for_slack(result)
        requests.post(response_url, json={
            "response_type": "in_channel",
            "text": f"*Marketing Simulation Complete!*\n\n{result}"
        })

    threading.Thread(target=background_sim).start()

    return jsonify({
        "response_type": "in_channel",
        "text": f"🚀 *{user}* started a marketing sim with `{init_count}` turns for:\n> {product_description}\n_Simulating..._"
    }), 200

@app.route("/chathtml", methods=["POST"])
def chathtml():
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
    response = format_conversation_for_html(response)
    return jsonify({"response": response})

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