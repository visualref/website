import React, { useState, useEffect } from 'react';
import './ChatScreen.css';

// each model has its own conversation that subtly shows vishnu's skills
// feels like a real chat but tells a story
const conversations = {
  claude: [
    {
      role: 'assistant',
      text: "Hi! I'm Claude. I can see you've been exploring Vishnupriya's portfolio.",
      delay: 0,
    },
    {
      role: 'assistant',
      text: "She built this entire nav component using React + pure CSS — no animation libraries. The morph between states? That's all CSS transitions.",
      delay: 600,
    },
    {
      role: 'user',
      text: "What else has she built?",
      delay: 1400,
    },
    {
      role: 'assistant',
      text: "A flip card carousel, a DevSecOps CI/CD pipeline, an NLP sentiment dashboard, and a full-stack football analytics app — built in a hackathon.",
      delay: 2200,
    },
    {
      role: 'assistant',
      text: "First Class BSc Computer Science from UEL. CGPA 9.37/10. Currently interning at Visualref as a Software Engineer.",
      delay: 3000,
    },
  ],
  gpt: [
    {
      role: 'assistant',
      text: "Hey! I'm ChatGPT. Want to know what makes Vishnupriya stand out as an engineer?",
      delay: 0,
    },
    {
      role: 'user',
      text: "Yes, tell me.",
      delay: 700,
    },
    {
      role: 'assistant',
      text: "She doesn't just learn tools — she builds with them. React, Node.js, MongoDB, Python, Docker, AWS. Full stack, end to end.",
      delay: 1500,
    },
    {
      role: 'assistant',
      text: "At a hackathon she built a complete football data analysis app with her team under time pressure. REST APIs, React UI, MongoDB — shipped and working.",
      delay: 2400,
    },
    {
      role: 'assistant',
      text: "That's the kind of engineer you want on your team.",
      delay: 3200,
    },
  ],
  gemini: [
    {
      role: 'assistant',
      text: "Hello! I'm Gemini. Vishnupriya has been working in AI and ML — let me show you what she's built.",
      delay: 0,
    },
    {
      role: 'assistant',
      text: "She built an NLP sentiment dashboard that analyses student feedback and classifies sentiment — presented to non-technical stakeholders via dashboards.",
      delay: 800,
    },
    {
      role: 'user',
      text: "Any other AI work?",
      delay: 1600,
    },
    {
      role: 'assistant',
      text: "An AI-powered password strength analyser using ML classifiers. Python, real data, real model. Not a tutorial — original work.",
      delay: 2400,
    },
    {
      role: 'assistant',
      text: "Her stack includes Python, NLP, ML, React and she's currently deepening her AI knowledge at Visualref.",
      delay: 3200,
    },
  ],
  copilot: [
    {
      role: 'assistant',
      text: "Hi! I'm Copilot. Let me tell you about Vishnupriya's engineering practices.",
      delay: 0,
    },
    {
      role: 'assistant',
      text: "She built a full DevSecOps CI/CD pipeline — automated linting, security scanning with Snyk, Docker containerisation, all triggered on every GitHub commit.",
      delay: 700,
    },
    {
      role: 'user',
      text: "That's production level. What else?",
      delay: 1600,
    },
    {
      role: 'assistant',
      text: "Selected for SecurityHQ's Diversity of Thought Programme — exploring SOC workflows and cybersecurity operations.",
      delay: 2400,
    },
    {
      role: 'assistant',
      text: "She writes clean, documented code. You can see it yourself: github.com/vishnupriya-shisode",
      delay: 3200,
    },
  ],
};

// model brand colors and names
const modelInfo = {
  claude:  { name: 'Claude',   color: '#e07a3a', bg: '#fde8d8', initial: 'C' },
  gpt:     { name: 'ChatGPT',  color: '#4a9e5c', bg: '#d8f0de', initial: 'G' },
  gemini:  { name: 'Gemini',   color: '#5c6bc0', bg: '#dde0f5', initial: 'Ge' },
  copilot: { name: 'Copilot',  color: '#3a7ec4', bg: '#d8eaf5', initial: 'Co' },
};

function ChatScreen({ model, lightMode }) {
  // visibleMessages = how many messages are currently showing
  // starts at 0 and increments as each message appears
  const [visibleMessages, setVisibleMessages] = useState(0);

  const info = modelInfo[model];
  const messages = conversations[model];

  // every time model changes reset messages and replay the conversation
  useEffect(() => {
    setVisibleMessages(0);

    // schedule each message to appear at its delay time
    const timers = messages.map((msg, index) => {
      return setTimeout(() => {
        // add one message at a time
        setVisibleMessages(index + 1);
      }, msg.delay + 400);
    });

    // cleanup all timers if model changes before they fire
    return () => timers.forEach(clearTimeout);
  }, [model]);

  return (
    <div className="chat-screen">

      {/* ── chat header ── */}
      <div className="chat-header">
        <div
          className="chat-avatar"
          style={{ background: info.bg, color: info.color }}
        >
          {info.initial}
        </div>
        <div className="chat-header-text">
          <span className="chat-name">{info.name}</span>
          <span className="chat-status">online</span>
        </div>
      </div>

      {/* ── messages area ── */}
      <div className="chat-messages">
        {messages.slice(0, visibleMessages).map((msg, index) => (
          <div
            key={index}
            className={`chat-bubble ${msg.role}`}
          >
            {msg.text}
          </div>
        ))}

        {/* typing indicator shows when next message is loading */}
        {visibleMessages < messages.length && visibleMessages > 0 && (
          <div className="chat-bubble assistant typing">
            <span /><span /><span />
          </div>
        )}
      </div>

      {/* ── fake input bar ── */}
      <div className="chat-input-bar">
        <div className="chat-input-field">
          Message {info.name}...
        </div>
        <button
          className="chat-send"
          style={{ background: info.color }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white"
            strokeWidth="2" strokeLinecap="round">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </div>

    </div>
  );
}

export default ChatScreen;