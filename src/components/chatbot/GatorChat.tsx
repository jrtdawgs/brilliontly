'use client';

import { useState, useRef, useEffect } from 'react';
import { findResponse, GATOR_CONFIG, type ChatMessage } from '@/lib/chatbot/knowledge';

export default function GatorChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'gator',
      content: GATOR_CONFIG.greeting,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const response = findResponse(input);
    const gatorMessage: ChatMessage = {
      role: 'gator',
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, gatorMessage]);
    setInput('');
  };

  return (
    <>
      {/* Chat bubble button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25 flex items-center justify-center hover:scale-110 transition-transform gator-bubble"
          title="Chat with Gator"
        >
          {/* Alligator SVG icon */}
          <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none">
            {/* Body */}
            <ellipse cx="32" cy="38" rx="18" ry="12" fill="#22c55e" />
            {/* Head */}
            <ellipse cx="32" cy="24" rx="14" ry="10" fill="#16a34a" />
            {/* Snout */}
            <ellipse cx="32" cy="20" rx="10" ry="6" fill="#22c55e" />
            {/* Eyes */}
            <circle cx="26" cy="18" r="3" fill="white" />
            <circle cx="38" cy="18" r="3" fill="white" />
            <circle cx="26" cy="18" r="1.5" fill="#0a0f1a" />
            <circle cx="38" cy="18" r="1.5" fill="#0a0f1a" />
            {/* Nostrils */}
            <circle cx="29" cy="16" r="1" fill="#15803d" />
            <circle cx="35" cy="16" r="1" fill="#15803d" />
            {/* Mouth line */}
            <path d="M22 22 Q32 26 42 22" stroke="#15803d" strokeWidth="1.5" fill="none" />
            {/* Teeth */}
            <path d="M25 22 L26 24 L27 22" fill="white" />
            <path d="M37 22 L38 24 L39 22" fill="white" />
          </svg>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-[#111827] border border-[#1e293b] rounded-2xl shadow-2xl flex flex-col fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <svg viewBox="0 0 64 64" className="w-7 h-7" fill="none">
                  <ellipse cx="32" cy="24" rx="14" ry="10" fill="#16a34a" />
                  <ellipse cx="32" cy="20" rx="10" ry="6" fill="#22c55e" />
                  <circle cx="26" cy="18" r="3" fill="white" />
                  <circle cx="38" cy="18" r="3" fill="white" />
                  <circle cx="26" cy="18" r="1.5" fill="#0a0f1a" />
                  <circle cx="38" cy="18" r="1.5" fill="#0a0f1a" />
                  <path d="M22 22 Q32 26 42 22" stroke="#15803d" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Gator</h3>
                <p className="text-green-400 text-xs">Your Investment Buddy</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-[#1e293b] text-gray-200 rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#1e293b]">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Gator anything about investing..."
                className="flex-1 bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:hover:bg-green-600 text-white rounded-xl p-2.5 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
