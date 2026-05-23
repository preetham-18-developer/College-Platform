import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, ChevronDown } from 'lucide-react';
import colleges from '../data/colleges';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI College Advisor. I can help you find colleges, compare placements, or answer questions about admissions. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    "Best colleges for CSE?",
    "Compare VIT and SRM",
    "Colleges with >10 LPA package",
    "What is the fee for JNTU?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  // AIAvatar Component for robust image rendering
  const AIAvatar = ({ size = 28 }) => {
    const [imgError, setImgError] = useState(false);
    
    // Using a reliable, modern AI avatar placeholder with a fallback to the Bot icon
    const avatarSrc = "https://api.dicebear.com/7.x/bottts/svg?seed=NVIDIA&backgroundColor=4f46e5";

    if (imgError) {
      return (
        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: size, height: size }}>
          <Bot size={size * 0.6} />
        </div>
      );
    }

    return (
      <img 
        src={avatarSrc}
        alt="AI Advisor" 
        className="rounded-circle shadow-sm object-fit-cover bg-white"
        style={{ width: size, height: size }}
        onError={(e) => {
          // If external avatar fails, try local public folder, then set error
          if (!e.target.dataset.triedLocal) {
            e.target.dataset.triedLocal = "true";
            e.target.src = "/ai-avatar.png";
          } else {
            setImgError(true);
          }
        }}
      />
    );
  };

  // Backend Integration
  const generateResponse = async (query) => {
    setIsTyping(true);
    
    try {
      // Build context from local colleges to make the AI aware of the platform data
      const contextData = colleges.slice(0, 5).map(c => `${c.name}: Rating ${c.rating}, Fees ₹${c.fees}, Placements ${c.placements}`).join(" | ");

      const systemPrompt = `You are an AI assistant for a premium college discovery and decision-making platform.
Your role is to help students with: college recommendations, placements, admissions, courses, fees, rankings, campus comparisons, predictor guidance, education-related decision making, and platform navigation.
You must only answer questions related to: colleges, universities, education, admissions, placements, rankings, student guidance, and this platform.
If users ask unrelated questions: politely redirect them back to education or platform-related topics.
Behavior Requirements: concise, intelligent, accurate, student-friendly, conversational, professional.
Avoid: hallucinating fake information, making unsupported claims, answering unrelated topics, giving harmful advice.
When recommending or comparing colleges, provide structured, balanced insights based on affordability, placements, ratings, and courses.
Keep responses structured, readable, realistic, and concise. You are not a general-purpose chatbot.
Here is some context about top colleges on our platform: ${contextData}`;

      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.slice(-4).map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: query }
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: apiMessages
        })
      });

      if (!response.ok) {
        throw new Error(`Backend Error: ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.response;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      console.error("Backend API Error:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting to my brain right now. Please check if the backend server is running!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    await generateResponse(input);
  };

  const handleSuggestionClick = async (suggestion) => {
    const userMessage = {
      role: 'user',
      content: suggestion,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    await generateResponse(suggestion);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`btn btn-premium rounded-circle shadow-lg position-fixed d-flex align-items-center justify-content-center transition-all ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        style={{
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          zIndex: 1040,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <Sparkles size={24} className="text-white" />
      </button>

      {/* Chat Widget */}
      <div
        className={`premium-card position-fixed shadow-xl d-flex flex-column ${isOpen ? 'translate-y-0 opacity-100 visible' : 'translate-y-4 opacity-0 invisible'}`}
        style={{
          bottom: '2rem',
          right: '2rem',
          width: '380px',
          height: '600px',
          maxHeight: '80vh',
          zIndex: 1050,
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          transformOrigin: 'bottom right',
          transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)'
        }}
      >
        {/* Header */}
        <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-white bg-opacity-25 p-2 rounded-circle">
              <AIAvatar size={24} />
            </div>
            <div>
              <h6 className="mb-0 fw-bold">AI Advisor</h6>
              <span className="small text-white-50 d-flex align-items-center gap-1">
                <span className="bg-success rounded-circle d-inline-block" style={{ width: '8px', height: '8px' }}></span> Online
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="btn btn-link text-white p-0 border-0 shadow-none hover-scale"
          >
            <ChevronDown size={24} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-grow-1 overflow-auto p-3 bg-light-subtle d-flex flex-column gap-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
              <div className={`d-flex gap-2 max-w-75 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`} style={{ maxWidth: '85%' }}>
                <div className={`flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-primary text-white rounded-circle d-flex align-items-center justify-content-center' : ''}`} style={msg.role === 'user' ? { width: '28px', height: '28px' } : {}}>
                  {msg.role === 'user' ? <User size={14} /> : <AIAvatar size={28} />}
                </div>
                <div>
                  <div className={`p-3 rounded-4 shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white text-dark border'}`} style={{ borderTopLeftRadius: msg.role === 'assistant' ? '0' : '1rem', borderTopRightRadius: msg.role === 'user' ? '0' : '1rem' }}>
                    <p className="mb-0 fs-6 lh-sm whitespace-pre-wrap" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                  </div>
                  <span className={`small text-muted mt-1 d-block ${msg.role === 'user' ? 'text-end' : 'text-start'}`} style={{ fontSize: '11px' }}>
                    {msg.time}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="d-flex justify-content-start">
              <div className="d-flex gap-2">
                <div className="flex-shrink-0 mt-1">
                  <AIAvatar size={28} />
                </div>
                <div className="bg-white p-3 rounded-4 shadow-sm border" style={{ borderTopLeftRadius: '0' }}>
                  <div className="typing-indicator d-flex gap-1 align-items-center h-100">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && !isTyping && (
          <div className="p-2 bg-light border-top border-bottom overflow-auto hide-scrollbar d-flex gap-2 flex-nowrap">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="btn btn-sm btn-white border rounded-pill flex-shrink-0 text-primary bg-white shadow-sm hover-bg-light transition-all"
                style={{ fontSize: '12px' }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 bg-white border-top">
          <form onSubmit={handleSend} className="d-flex gap-2 position-relative">
            <input
              type="text"
              className="form-control premium-input pe-5 rounded-pill"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="btn btn-primary rounded-circle position-absolute end-0 top-50 translate-middle-y me-1 d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: '36px', height: '36px' }}
            >
              <Send size={16} />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-muted" style={{ fontSize: '10px' }}>Powered by NVIDIA AI</span>
          </div>
        </div>
      </div>

      <style>{`
        .typing-indicator span {
          display: inline-block;
          width: 6px;
          height: 6px;
          background-color: var(--primary-color);
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out both;
          opacity: 0.6;
        }
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default AIAssistant;
