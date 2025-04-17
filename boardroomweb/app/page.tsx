"use client";

import React, { useState } from "react";

export default function BusinessBoardroom() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");

  const handleAnalyze = () => {
    const axios = require('axios');
    let data = '';

    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://boardroom-197814739607.us-central1.run.app/',
      headers: { },
      data : data
    };

    axios.request(config)
      .then((response: { data: any }) => {
        console.log(JSON.stringify(response.data));
        setResult(`${response.data["message"]}`);
      })
      .catch((error: any) => {
        console.log(error);
      });

  };

  return (
    <main className="min-h-screen bg-black text-white p-8 font-mono">
       <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Business Boardroom</h1>

        <nav className="flex gap-4 text-sm underline underline-offset-4 text-gray-300">
          <a href="#slack" className="hover:text-white">Slack</a>
          <a href="#privacy" className="hover:text-white">Privacy Policy</a>
          <a href="#support" className="hover:text-white">Support</a>
        </nav>
      </div>

      <div className="text-left text-sm mt-2 mb-2 px-0">
        <p>
          Designed for product ideation, marketing analysis, and strategic decision-making, it integrates with Slack to allow agent interactions in team channels, as well as a standalone frontend website for web-based simulations. At its core, it uses LangGraph to coordinate the flow of conversation between intelligent agents—CEO, Marketing Strategist, and Marketing Intern—each powered by few-shot prompting and controlled generation techniques. The app supports long context windows to maintain continuity across agent turns, and uses structured output for clean integration with enterprise tools or further evaluation pipelines.
        </p>
      </div>

      <div className="flex justify-around text-lg mt-2">
        <span>👔 CEO</span>
        <span>🧃 Marketing Intern</span>
        <span>📊 Analyst</span>
      </div>

      <div className="mb-4 border-white">
        <label htmlFor="description" className="block mb-2 text-sm">
          Product
        </label>
        <textarea
          id="description"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-32 p-2 border border-white text-white rounded"
          placeholder="Enter product description..."
        />
      </div>

      <button
        onClick={handleAnalyze}
        className="bg-white text-black px-4 py-2 rounded mb-6 hover:bg-gray-300"
      >
        Try
      </button>

      <div className="border border-white p-4 rounded">
        <h2 className="text-sm mb-2">Result</h2>
        <p>{result}</p>
      </div>
    </main>
  );
}
