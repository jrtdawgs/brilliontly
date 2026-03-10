'use client';

import { useState, useRef, useEffect } from 'react';
import { findResponse, BIGBULL_CONFIG, type ChatMessage } from '@/lib/chatbot/knowledge';

// Horizontal alligator SVG - Big Bull the Gator
function BigBullIcon({ size = 'large' }: { size?: 'large' | 'small' }) {
  const w = size === 'large' ? 'w-14 h-9' : 'w-9 h-6';
  return (
    <svg viewBox="0 0 120 52" className={w} fill="none">
      {/* ===== TAIL (wavy, thick, tapered) ===== */}
      <path d="M2 30 Q6 18 12 24 Q9 30 13 34 Q10 38 15 32" fill="#16a34a" />
      <path d="M2 30 Q6 38 13 34" fill="#1a8c3e" />
      {/* Tail spikes */}
      <path d="M6 22 L8 18 L10 23" fill="#15803d" />
      <path d="M10 20 L12 16 L14 21" fill="#15803d" />

      {/* ===== BODY ===== */}
      <ellipse cx="36" cy="30" rx="22" ry="13" fill="#22c55e" />
      {/* Belly (lighter underside) */}
      <ellipse cx="36" cy="35" rx="17" ry="6" fill="#4ade80" opacity="0.35" />
      {/* Scute ridges along spine */}
      <path d="M16 20 L19 15 L22 20" fill="#16a34a" />
      <path d="M22 18 L25 13 L28 18" fill="#16a34a" />
      <path d="M28 17 L31 12 L34 17" fill="#15803d" />
      <path d="M34 16.5 L37 12 L40 17" fill="#16a34a" />
      <path d="M40 17 L43 13 L46 18" fill="#15803d" />
      {/* Body texture lines */}
      <path d="M22 28 Q30 26 44 28" stroke="#1a8c3e" strokeWidth="0.5" fill="none" opacity="0.5" />
      <path d="M24 32 Q34 31 42 33" stroke="#1a8c3e" strokeWidth="0.5" fill="none" opacity="0.4" />

      {/* ===== LEGS ===== */}
      {/* Back leg */}
      <path d="M22 38 L18 46 L21 44 L23 47 L25 44 L24 38" fill="#1a8c3e" />
      {/* Front leg */}
      <path d="M46 37 L43 45 L46 43 L48 46 L50 43 L49 37" fill="#1a8c3e" />

      {/* ===== HEAD ===== */}
      {/* Neck/head base */}
      <ellipse cx="58" cy="28" rx="12" ry="10" fill="#22c55e" />
      {/* Snout - long and flat */}
      <path d="M58 22 Q72 18 88 22 Q90 24 88 26 Q72 28 58 26 Z" fill="#22c55e" />
      {/* Upper jaw ridge */}
      <path d="M60 22 Q74 19 88 22 Q74 21 60 23 Z" fill="#1a8c3e" />
      {/* Lower jaw (slightly separated) */}
      <path d="M58 27 Q72 29 86 27 Q84 25 58 26 Z" fill="#2dd671" />
      {/* Jaw separation line */}
      <path d="M56 25 Q72 26.5 90 24.5" stroke="#15803d" strokeWidth="1.2" fill="none" />

      {/* Teeth - top jaw (hanging down) */}
      <path d="M66 24 L67 27 L68 24" fill="white" />
      <path d="M72 23.5 L73 26.5 L74 23.5" fill="white" />
      <path d="M78 23 L79 26 L80 23" fill="white" />
      <path d="M83 23.5 L84 26 L85 23.5" fill="white" />
      {/* Teeth - bottom jaw (pointing up) */}
      <path d="M69 26.5 L70 24 L71 26.5" fill="white" />
      <path d="M75 26 L76 23.5 L77 26" fill="white" />
      <path d="M81 26 L82 24 L83 26" fill="white" />

      {/* ===== EYE BUMPS (protruding above head) ===== */}
      <ellipse cx="56" cy="18" rx="4.5" ry="5" fill="#22c55e" />
      <ellipse cx="56" cy="17.5" rx="3.5" ry="4" fill="#1a8c3e" />
      {/* Eye */}
      <circle cx="56" cy="17" r="3" fill="#f0fdf4" />
      <circle cx="56.5" cy="16.5" r="1.8" fill="#15803d" />
      <circle cx="57" cy="16" r="0.8" fill="#0a0f1a" />
      {/* Eye shine */}
      <circle cx="55" cy="15.5" r="0.6" fill="white" opacity="0.8" />

      {/* Nostrils at tip of snout */}
      <circle cx="87" cy="22.5" r="1" fill="#15803d" />
      <circle cx="87" cy="25" r="1" fill="#15803d" />

      {/* ===== TAIL TIP ===== */}
      <path d="M2 30 Q0 28 2 26" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export default function GatorChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bigbull',
      content: BIGBULL_CONFIG.greeting,
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
    const bigBullMessage: ChatMessage = {
      role: 'bigbull',
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, bigBullMessage]);
    setInput('');
  };

  return (
    <>
      {/* Chat bubble button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25 flex items-center gap-2 px-4 py-3 hover:scale-105 transition-transform gator-bubble"
          title="Chat with Big Bull"
        >
          <BigBullIcon size="large" />
          <span className="text-white text-xs font-bold">Big Bull</span>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-[#111827] border border-[#1e293b] rounded-2xl shadow-2xl flex flex-col fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <BigBullIcon size="small" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Big Bull</h3>
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
                placeholder="Ask Big Bull anything about investing..."
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
