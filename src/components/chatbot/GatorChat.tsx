'use client';

import { useState, useRef, useEffect } from 'react';
import { findResponse, BIGBULL_CONFIG, type ChatMessage } from '@/lib/chatbot/knowledge';

// Horizontal alligator SVG - Big Bull the Gator
// Dark navy outline so the green body pops against dark backgrounds
function BigBullIcon({ size = 'large' }: { size?: 'large' | 'small' }) {
  const w = size === 'large' ? 'w-16 h-10' : 'w-10 h-7';
  const stroke = '#0f172a'; // Navy/dark outline
  const sw = '1.4'; // Stroke width
  return (
    <svg viewBox="0 0 140 56" className={w} fill="none">
      {/* ===== LONG TAIL (thick, muscular, tapered with curves) ===== */}
      <path
        d="M2 32 Q4 22 10 26 Q14 16 18 24 Q20 30 22 28"
        fill="#16a34a" stroke={stroke} strokeWidth={sw}
      />
      <path d="M2 32 Q4 38 10 36 Q14 40 18 34 Q20 30 22 32" fill="#1a8c3e" stroke={stroke} strokeWidth={sw} />
      {/* Tail tip */}
      <path d="M1 32 Q-1 29 1 26" stroke={stroke} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Tail spikes/scutes */}
      <path d="M8 20 L10 15 L12 20" fill="#15803d" stroke={stroke} strokeWidth="0.8" />
      <path d="M13 18 L15 13 L17 18" fill="#15803d" stroke={stroke} strokeWidth="0.8" />
      <path d="M18 17 L20 12 L22 17" fill="#16a34a" stroke={stroke} strokeWidth="0.8" />

      {/* ===== BODY (muscular oval) ===== */}
      <ellipse cx="42" cy="30" rx="22" ry="14" fill="#22c55e" stroke={stroke} strokeWidth={sw} />
      {/* Belly (lighter underside) */}
      <ellipse cx="42" cy="36" rx="16" ry="6" fill="#4ade80" opacity="0.3" />
      {/* Body scute ridges along spine */}
      <path d="M24 19 L27 13 L30 19" fill="#16a34a" stroke={stroke} strokeWidth="0.8" />
      <path d="M30 17 L33 11 L36 17" fill="#15803d" stroke={stroke} strokeWidth="0.8" />
      <path d="M36 16 L39 10 L42 16" fill="#16a34a" stroke={stroke} strokeWidth="0.8" />
      <path d="M42 16 L45 10 L48 16" fill="#15803d" stroke={stroke} strokeWidth="0.8" />
      <path d="M48 17 L51 12 L54 17" fill="#16a34a" stroke={stroke} strokeWidth="0.8" />
      {/* Body texture */}
      <path d="M28 28 Q38 26 52 28" stroke="#1a8c3e" strokeWidth="0.6" fill="none" opacity="0.5" />
      <path d="M30 33 Q40 32 50 34" stroke="#1a8c3e" strokeWidth="0.5" fill="none" opacity="0.4" />

      {/* ===== LEGS (stocky, splayed with toes) ===== */}
      {/* Back left leg */}
      <path d="M28 40 L24 50 L27 48 L29 51 L31 48 L30 40" fill="#1a8c3e" stroke={stroke} strokeWidth="1" />
      {/* Front left leg */}
      <path d="M52 39 L49 49 L52 47 L54 50 L56 47 L55 39" fill="#1a8c3e" stroke={stroke} strokeWidth="1" />

      {/* ===== HEAD ===== */}
      {/* Neck/head base */}
      <ellipse cx="66" cy="28" rx="13" ry="11" fill="#22c55e" stroke={stroke} strokeWidth={sw} />
      {/* Snout - long, flat, powerful */}
      <path d="M66 21 Q82 17 102 21 Q104 24 102 27 Q82 30 66 27 Z" fill="#22c55e" stroke={stroke} strokeWidth={sw} />
      {/* Upper jaw ridge (darker stripe) */}
      <path d="M68 21 Q84 18 102 21 Q84 20 68 22 Z" fill="#1a8c3e" />
      {/* Lower jaw (slightly open) */}
      <path d="M66 28 Q82 31 100 28 Q98 26 66 27 Z" fill="#2dd671" stroke={stroke} strokeWidth="1" />
      {/* Jaw separation line */}
      <path d="M64 25 Q82 27 104 24" stroke={stroke} strokeWidth="1.3" fill="none" />

      {/* Teeth - top jaw */}
      <path d="M76 24 L77 27.5 L78 24" fill="white" stroke={stroke} strokeWidth="0.4" />
      <path d="M82 23.5 L83 27 L84 23.5" fill="white" stroke={stroke} strokeWidth="0.4" />
      <path d="M88 23 L89 26.5 L90 23" fill="white" stroke={stroke} strokeWidth="0.4" />
      <path d="M94 23.5 L95 26.5 L96 23.5" fill="white" stroke={stroke} strokeWidth="0.4" />
      {/* Teeth - bottom jaw */}
      <path d="M79 27 L80 24.5 L81 27" fill="white" stroke={stroke} strokeWidth="0.4" />
      <path d="M85 26.5 L86 24 L87 26.5" fill="white" stroke={stroke} strokeWidth="0.4" />
      <path d="M91 26.5 L92 24 L93 26.5" fill="white" stroke={stroke} strokeWidth="0.4" />

      {/* ===== EYE BUMP (protruding above head like real gator) ===== */}
      <ellipse cx="64" cy="17" rx="5" ry="5.5" fill="#22c55e" stroke={stroke} strokeWidth={sw} />
      <ellipse cx="64" cy="16.5" rx="3.8" ry="4.2" fill="#1a8c3e" />
      {/* Eye */}
      <circle cx="64" cy="16" r="3.2" fill="#f0fdf4" stroke={stroke} strokeWidth="0.6" />
      <circle cx="64.5" cy="15.5" r="2" fill="#15803d" />
      <circle cx="65" cy="15" r="0.9" fill="#0a0f1a" />
      {/* Eye shine */}
      <circle cx="63" cy="14.5" r="0.7" fill="white" opacity="0.85" />

      {/* Nostrils */}
      <circle cx="101" cy="22" r="1.1" fill={stroke} />
      <circle cx="101" cy="25.5" r="1.1" fill={stroke} />

      {/* Armored plate texture on body */}
      <rect x="34" y="22" width="3" height="2.5" rx="0.5" fill="#1a8c3e" opacity="0.4" />
      <rect x="39" y="21" width="3" height="2.5" rx="0.5" fill="#1a8c3e" opacity="0.4" />
      <rect x="44" y="22" width="3" height="2.5" rx="0.5" fill="#1a8c3e" opacity="0.4" />
      <rect x="36" y="26" width="3" height="2.5" rx="0.5" fill="#1a8c3e" opacity="0.3" />
      <rect x="41" y="25" width="3" height="2.5" rx="0.5" fill="#1a8c3e" opacity="0.3" />
      <rect x="46" y="26" width="3" height="2.5" rx="0.5" fill="#1a8c3e" opacity="0.3" />
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
