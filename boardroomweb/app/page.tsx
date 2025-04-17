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

        {/* Navbar */}
        <div className="sticky top-0 z-50 bg-black text-white px-4 py-3 flex justify-between items-center border-b border-white">
          <h1 className="text-4xl font-bold">👔🧃📊 Business Boardroom</h1>
          <nav className="space-x-4">
            <a href="#home" className="hover:underline">Home</a>
            <a href="#slack" className="hover:underline">Slack</a>
            <a href="#privacy" className="hover:underline">Privacy</a>
            <a href="#contact" className="hover:underline">Contact</a>
          </nav>
        </div>

      {/* Short description of the app */}
      <div id ="home" className="text-left text-sm mt-2 mb-2 px-0 scroll-mt-18">
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
        className="bg-white text-black px-4 py-2 rounded mb-4 hover:bg-gray-400"
      >
        Try
      </button>

      <div className="border border-white p-4 rounded">
        <h2 className="text-sm mb-2">Result</h2>
        <p>{result}</p>
      </div>

      <div id="slack" className="text-white mt-10 pt-10 scroll-mt-8 px-4 font-mono text-sm leading-relaxed max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">🤖 Slack Integration</h2>
        <p className="mb-4">
          This app also comes with a Slack extension that lets you simulate structured business conversations right from your Slack workspace using the <code className="bg-gray-800 px-1 py-0.5 rounded text-white">/simulate</code> slash command.
          Simply enter the number of iterations and product description as arguments (e.g., <code className="bg-gray-800 px-1 py-0.5 rounded text-white">/simulate 3 Magnetic Toothbrush</code>), and the agents will start brainstorming directly in your channel.
        </p>
        <div className="mb-4">
          <a href="https://slack.com/oauth/v2/authorize?client_id=8699577646279.8749578056933&scope=commands&user_scope=">
            <img
              alt="Add to Slack"
              height="40"
              width="139"
              src="https://platform.slack-edge.com/img/add_to_slack.png"
              srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
            />
          </a>
        </div>
      </div>

      {/* Privacy Policy */}
      <div id="privacy" className="text-white mt-10 pt-10 scroll-mt-8 px-4 font-mono text-sm leading-relaxed max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">📜 Privacy Policy</h2>
        <p className="mb-2">Last updated: April 17, 2025</p>

        <p className="mb-4">
          At <strong>Business Boardroom</strong>, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard data when you use our web app or Slack extension.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-2">1. Information We Collect</h3>
        <ul className="list-disc list-inside mb-4">
          <li>Product Descriptions you input for simulation</li>
          <li>Number of Iterations specified in commands</li>
          <li>Slack User IDs (if you install the Slack extension)</li>
          <li>Timestamps of interactions for debugging and analytics</li>
        </ul>
        <p className="mb-4">We do <strong>not</strong> collect or store sensitive personal data, passwords, or Slack messages unrelated to our slash commands.</p>

        <h3 className="text-lg font-semibold mt-6 mb-2">2. How We Use Your Information</h3>
        <ul className="list-disc list-inside mb-4">
          <li>Simulating conversations between virtual agents</li>
          <li>Improving functionality and performance</li>
          <li>Diagnosing errors and improving user experience</li>
        </ul>
        <p className="mb-4">We do not use your data for advertising or profiling.</p>

        <h3 className="text-lg font-semibold mt-6 mb-2">3. Data Retention</h3>
        <p className="mb-4">We retain anonymized simulation logs temporarily (under 7 days). No personally identifiable information is stored long-term.</p>

        <h3 className="text-lg font-semibold mt-6 mb-2">4. Data Sharing</h3>
        <p className="mb-4">We do <strong>not</strong> sell, trade, or share your data, except if required by law or to prevent abuse/fraud.</p>

        <h3 className="text-lg font-semibold mt-6 mb-2">5. Your Rights</h3>
        <p className="mb-4">You may contact us anytime to request data deletion or ask how your data is used.</p>

        <h3 className="text-lg font-semibold mt-6 mb-2">6. Slack Permissions</h3>
        <p className="mb-4">When installing our Slack extension, we only request permissions needed for the <code>/simulate</code> command. We do <strong>not</strong> access other content in your Slack channels.</p>

        <h3 className="text-lg font-semibold mt-6 mb-2">7. Changes to This Policy</h3>
        <p className="mb-4">We may update this policy. Changes will be posted here with an updated date.</p>
      </div>

      <div id="contact" className="text-white mt-10 pt-10 scroll-mt-8 px-4 font-mono text-sm leading-relaxed max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">📬 Contact</h2>
      <p className="text-sm max-w-xl">
        For any issues, feedback, or collaboration inquiries, feel free to reach out via email.
        <br />
        Contact us at: <a href="mailto:ianiket23@gmail.com" className="underline text-blue-400">ianiket23@gmail.com</a>
      </p>
    </div>

    </main>
  );
}
