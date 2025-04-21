"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";

export default function BusinessBoardroom() {
  const [text, setText] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");
  const [initCount, setInitCount] = useState(3); // State for init_count

  // Dot animation logic
  useEffect(() => {
    if (!loading) return;

    let count = 0;
    const interval = setInterval(() => {
      count = (count + 1) % 4;
      setDots(".".repeat(count));
    }, 500);

    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = () => {
    setLoading(true);
    setResult("");

    if (!text) {
      setResult("Please enter a product description.");
      setLoading(false);
      return;
    }

    const data = JSON.stringify({
      product_description: text,
      init_count: initCount, // Use the selected init_count value
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://boardroom-197814739607.us-central1.run.app/chathtml",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        setResult(response.data["response"]);
      })
      .catch((error) => {
        console.error(error);
        setResult("Something went wrong.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 font-mono">

      {/* Navbar */}
        <div className="sticky top-0 z-50 bg-black text-white px-4 py-3 border-b border-white">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-4xl font-bold">👔🧃📊 Business Boardroom</h1>
            {/* Hamburger Icon - Only shows on small screens */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <nav
            className={`flex-col md:flex-row md:flex justify-end mt-2 md:mt-0 space-y-2 md:space-y-0 md:space-x-4 ${
              mobileMenuOpen ? "flex" : "hidden"
            } md:flex`}
          >
            <a href="#home" onClick={() => setMobileMenuOpen(false)} className="hover:underline">Home</a>
            <a href="https://medium.com/@ianiket23/reimagining-the-boardroom-a-genai-powered-business-simulation-80e9c20a41ed" onClick={() => setMobileMenuOpen(false)} className="hover:underline">Blog</a>
            <a href="#slack" onClick={() => setMobileMenuOpen(false)} className="hover:underline">Slack</a>
            <a href="https://www.kaggle.com/code/ianiket23/business-boardroom-kaggle-edition" onClick={() => setMobileMenuOpen(false)} className="hover:underline">Kaggle</a>
            <a href="#privacy" onClick={() => setMobileMenuOpen(false)} className="hover:underline">Privacy</a>
            <a href="#terms" onClick={() => setMobileMenuOpen(false)} className="hover:underline">Terms</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:underline">Contact</a>
          </nav>
        </div>


      {/* Short description of the app */}
      <div id ="home" className="text-left text-sm mt-2 mb-2 px-0 scroll-mt-24">
        <p>
          Designed for product ideation, marketing analysis, and strategic decision-making, it integrates with Slack to allow agent interactions in team channels, as well as a standalone frontend website for web-based simulations. At its core, it uses LangGraph to coordinate the flow of conversation between intelligent agents—CEO, Marketing Strategist, and Marketing Intern—each powered by zero-shot prompting and controlled generation techniques. The app supports long context windows to maintain continuity across agent turns, and uses structured output for clean integration with enterprise tools or further evaluation pipelines.
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

      <div className="flex items-center space-x-4">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`px-4 py-2 rounded mb-4 ${
            loading
              ? "bg-gray-600 text-white cursor-not-allowed"
              : "bg-white text-black hover:bg-gray-400"
          }`}
        >
          Try Now
        </button>

        <div className="mb-4">
          <select
            id="initCount"
            value={initCount}
            onChange={(e) => setInitCount(Number(e.target.value))}
            disabled={loading}
            className={`w-32 p-2 border border-white text-white bg-black rounded ${
              loading
                ? "bg-gray-600 text-white cursor-not-allowed"
                : "w-32 p-2 border border-white text-white bg-black rounded"
            }`}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
      </div>


      {/* Result Section */}
      <div className="border border-white p-4 rounded">
        <h2 className="text-sm mb-2">Result</h2>
        {loading && (
          <div className="text-sm text-gray-400 mb-2">Analyzing{dots}</div>
        )}

        <div dangerouslySetInnerHTML={{ __html: result }} />
      </div>

      <div id="slack" className="text-white mt-10 pt-10 scroll-mt-14 px-4 font-mono text-sm leading-relaxed max-w-3xl">
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
      {/* Deep Dive */}
      <div className="text-white mt-10 pt-10 scroll-mt-14 px-4 font-mono text-sm leading-relaxed max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">🌊 Deep dive</h2>
        <p className="mb-4">
          This project was developed as part of the <a href="https://www.kaggle.com/competitions/gen-ai-intensive-course-capstone-2025q1" className="underline text-blue-400">Kaggle x Google GenAI Capstone Submission</a>. The goal was to create a simulation of a business boardroom meeting using generative AI. The project leverages LangGraph to facilitate conversations between virtual agents, each representing different roles in a business setting.
          <br />
          <br />
          Know more about the project by watching the video below:
        </p>
      </div>
      <div className="mt-6 w-full max-w-xl aspect-video">
        <iframe
          className="w-full h-full rounded-lg"
          src="https://www.youtube.com/embed/9DlSxQ5jegI"
          title="Google x Kaggle GenAI Submission - Business Boardroom"
          frameBorder="5"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {/* Use Cases */}
<div id="use-cases" className="text-white mt-10 pt-10 scroll-mt-14 px-4 font-mono text-sm leading-relaxed max-w-3xl">
  <h2 className="text-2xl font-bold mb-4">💼 Use Cases</h2>
  <p className="mb-4">
    Our platform supports a variety of real-world business applications, helping teams think through complex scenarios and innovate faster using AI-driven simulations. Here are some of the core use cases:
  </p>

  <h3 className="text-lg font-semibold mt-6 mb-2">1. Business Scenario Planning</h3>
  <p className="mb-4">
    Map out potential future scenarios and stress-test strategies by simulating diverse business conditions and decision pathways.
  </p>

  <h3 className="text-lg font-semibold mt-6 mb-2">2. Role-based Ideation or Brainstorming</h3>
  <p className="mb-4">
    Generate creative ideas by simulating different stakeholder perspectives using AI personas such as CEOs, interns, or product managers.
  </p>

  <h3 className="text-lg font-semibold mt-6 mb-2">3. Simulating Decisions with AI-driven Personas</h3>
  <p className="mb-4">
    Analyze the potential impact of decisions by observing how different AI roles respond, creating a dynamic feedback loop.
  </p>

  <h3 className="text-lg font-semibold mt-6 mb-2">4. Product Ideation</h3>
  <p className="mb-4">
    Quickly prototype, refine, and iterate on new product concepts through AI-assisted conversations that simulate team collaboration.
  </p>

  <h3 className="text-lg font-semibold mt-6 mb-2">5. Market-fit Discussions</h3>
  <p className="mb-4">
    Align product ideas with real market needs by using AI personas to mimic customer and stakeholder feedback.
  </p>

  <h3 className="text-lg font-semibold mt-6 mb-2">6. MVP Scoping</h3>
  <p className="mb-4">
    Define and prioritize the minimum viable product by simulating trade-offs, core features, and time-to-market constraints.
  </p>
</div>


{/* Gen AI Capabilities */}
<div id="genai" className="text-white mt-10 pt-10 scroll-mt-14 px-4 font-mono text-sm leading-relaxed max-w-3xl">
  <h2 className="text-2xl font-bold mb-4">🔑 Gen AI Capabilities</h2>
  <p className="mb-4">
    Our system leverages the latest in generative AI and multi-agent orchestration to simulate collaborative workflows across defined roles. Below are the core capabilities that power the experience:
  </p>

  <h3 className="text-lg font-semibold mt-6 mb-2">1. Agents</h3>
  <p className="mb-4">
    Multiple autonomous roles—including a CEO, Marketing Intern, and Marketing Strategist—act as distinct agents with specialized prompts and responsibilities. These agents communicate using <strong>LangGraph</strong> to coordinate and simulate realistic workflows.
  </p>

  <h3 className="text-lg font-semibold mt-6 mb-2">2. Function Calling (LangGraph)</h3>
  <p className="mb-4">
    LangGraph facilitates conditional logic and function-like transitions, such as <code>check_end</code>, allowing agents to pass control based on predefined logic—mimicking real-time function calls across roles.
  </p>

  <h3 className="text-lg font-semibold mt-6 mb-2">3. Long Context Window</h3>
  <p className="mb-4">
    Agents benefit from extended memory, enabling them to build on prior interactions. This supports rich continuity and deeper simulation fidelity.
  </p>

  <h3 className="text-lg font-semibold mt-6 mb-2">4. Structured Output & Controlled Generation</h3>
  <p className="mb-4">
    Each agent’s output is formatted by role and stage, allowing for consistent, structured conversation flows. This reflects early-stage implementations of controlled generative output.
  </p>

  <h3 className="text-lg font-semibold mt-6 mb-2">5. GenAI Evaluation</h3>
  <p className="mb-4">
    The Marketing Strategist agent reviews and evaluates ideas proposed by the Intern agent. This simulates a generative feedback loop—using GenAI to assess and refine GenAI-generated content.
  </p>
</div>

{/* Key Technologies */}
<div id="technologies" className="text-white mt-10 pt-10 scroll-mt-14 px-4 font-mono text-sm leading-relaxed max-w-3xl">
  <h2 className="text-2xl font-bold mb-4">🛠️ Key Technologies</h2>
  <p className="mb-4">
    Our system is built using a modern AI stack, leveraging powerful frameworks and tools that enable seamless orchestration, generation, and interaction. Below are the core technologies we use:
  </p>

  <h3 className="text-lg font-semibold mt-6 mb-2">1. LangGraph</h3>
  <p className="mb-4">
    Used for agent orchestration, LangGraph allows agents to interact through stateful graphs. This enables dynamic workflows, decision branching, and coordinated multi-agent processes.
  </p>

  <h3 className="text-lg font-semibold mt-6 mb-2">2. LangChain</h3>
  <p className="mb-4">
    Provides essential components like memory, tools, and model abstraction to streamline interactions between the agents and the underlying LLM infrastructure.
  </p>

  <h3 className="text-lg font-semibold mt-6 mb-2">3. Gradio</h3>
  <p className="mb-4">
    Enables a simple and intuitive user interface within a notebook or web app setting. Gradio is used for live demos, testing, and showcasing model outputs in a user-friendly way.
  </p>

  <h3 className="text-lg font-semibold mt-6 mb-2">4. Google Gemini</h3>
  <p className="mb-4">
    Acts as the LLM backbone powering agent responses. Gemini supports high-quality generative output and multimodal reasoning across the simulation.
  </p>

  <h3 className="text-lg font-semibold mt-6 mb-2">5. Google Cloud Console</h3>
  <p className="mb-4">
    Used for deploying and managing infrastructure, APIs, and billing. Google Cloud Console provides a centralized platform to monitor usage, manage credentials, and access advanced cloud services.
  </p>
</div>



      {/* Privacy Policy */}
      <div id="privacy" className="text-white mt-10 pt-10 scroll-mt-14 px-4 font-mono text-sm leading-relaxed max-w-3xl">
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


      {/* Terms of Service */}
      <div id="terms" className="text-white mt-10 pt-10 scroll-mt-14 px-4 font-mono text-sm leading-relaxed max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">⚖️ Terms of Service</h2>
        <p className="mb-2">Last updated: April 17, 2025</p>

        <p className="mb-4">
          Welcome to <strong>Business Boardroom</strong>. By using our web app or Slack extension, you agree to be bound by the following terms. Please read them carefully.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-2">1. Acceptance of Terms</h3>
        <p className="mb-4">
          By accessing or using our services, you confirm your acceptance of these Terms of Service. If you do not agree, you may not use the platform.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-2">2. Use of Service</h3>
        <ul className="list-disc list-inside mb-4">
          <li>Use the service only for lawful and intended purposes.</li>
          <li>Do not attempt to disrupt or compromise the platform’s integrity or security.</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-2">3. Account Responsibility</h3>
        <p className="mb-4">
          You are responsible for all activity under your account. Notify us immediately if you suspect unauthorized access.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-2">4. Limitation of Liability</h3>
        <p className="mb-4">
          We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-2">5. Modifications</h3>
        <p className="mb-4">
          We may update these terms from time to time. Continued use of the service after changes constitutes your acceptance of the new terms.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-2">6. Termination</h3>
        <p className="mb-4">
          We reserve the right to terminate or suspend access to our service for any reason, without prior notice.
        </p>
      </div>


      {/* Contact Section */}
      <div id="contact" className="text-white mt-10 pt-10 scroll-mt-14 px-4 font-mono text-sm leading-relaxed max-w-3xl">
      <h2 className=" text-2xl font-bold mb-4">📬 Contact</h2>
      <p className="text-sm max-w-xl">
        For any issues, feedback, or collaboration inquiries, feel free to reach out via email.
        <br />
        Contact us at: <a href="mailto:ianiket23@gmail.com" className="underline text-blue-400">ianiket23@gmail.com</a>
      </p>
    </div>

    <br />
    <br />
    <br />
    <div id="contact" className="text-white mt-10 pt-10 scroll-mt-14 px-4 font-mono text-sm leading-relaxed max-w-3xl border-t border-white">
      <h1 className=" text-9xl font-bold mb-4">👔🧃📊</h1>
      <p className="text-sm max-w-xl">
        Made by <a href="https://www.linkedin.com/in/ianiket23/" className="underline text-blue-400">Aniket Mishra</a> @2025
        <br />
        Check out my <a href="https://ianiket23.github.io/" className="underline text-blue-400">portfolio</a> for more projects.
        <br />
        </p>
    </div>

    </main>
  );
}
