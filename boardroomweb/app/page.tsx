"use client";

import React, { useState } from "react";

export default function BusinessBoardroom() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");

  const handleAnalyze = () => {
    setResult(`Processed: ${text}`);
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-4xl font-bold mb-2">Business Boardroom</h1>

      <div className="flex justify-around text-lg mt-6 mb-4">
        <span>CEO</span>
        <span>Intern</span>
        <span>Analyst</span>
      </div>

      <div className="mb-4 border-white">
        <label htmlFor="description" className="block mb-2 text-sm">
          Product Description
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
        <h2 className="text-xl mb-2">Result</h2>
        <p>{result}</p>
      </div>
    </main>
  );
}
