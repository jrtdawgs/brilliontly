'use client';

import { useState, useRef, useEffect } from 'react';
import { findResponse, BIGBULL_CONFIG, type ChatMessage } from '@/lib/chatbot/knowledge';

// Clean alligator SVG - Big Bull the Gator
// Dark navy outline, bright green body, long sweeping tail
function BigBullIcon({ size = 'large' }: { size?: 'large' | 'small' }) {
  const w = size === 'large' ? 'w-20 h-10' : 'w-12 h-7';
  const o = '#0f172a'; // Dark navy outline
  return (
    <svg viewBox="0 0 180 52" className={w} fill="none">
      {/* ===== TAIL - long sweeping curve ===== */}
      <path
        d="M3 26 C8 18, 16 14, 24 18 C30 21, 34 24, 40 26
           C34 28, 30 31, 24 34 C16 38, 8 34, 3 26Z"
        fill="#22c55e" stroke={o} strokeWidth="1.5"
      />
      {/* Tail ridge spikes */}
      <path d="M10 16 L12.5 10 L15 16" fill="#16a34a" stroke={o} strokeWidth="0.8" />
      <path d="M18 14 L20.5 8 L23 14" fill="#16a34a" stroke={o} strokeWidth="0.8" />
      <path d="M26 14 L28.5 8 L31 14" fill="#16a34a" stroke={o} strokeWidth="0.8" />

      {/* ===== BODY ===== */}
      <ellipse cx="60" cy="26" rx="24" ry="14" fill="#22c55e" stroke={o} strokeWidth="1.5" />
      {/* Belly highlight */}
      <ellipse cx="60" cy="32" rx="16" ry="5" fill="#4ade80" opacity="0.25" />
      {/* Spine ridge spikes */}
      <path d="M40 14 L42.5 8 L45 14" fill="#16a34a" stroke={o} strokeWidth="0.8" />
      <path d="M48 12 L50.5 6 L53 12" fill="#15803d" stroke={o} strokeWidth="0.8" />
      <path d="M56 12 L58.5 6 L61 12" fill="#16a34a" stroke={o} strokeWidth="0.8" />
      <path d="M64 12 L66.5 7 L69 12" fill="#15803d" stroke={o} strokeWidth="0.8" />
      {/* Scale texture */}
      <path d="M46 24 Q56 22 70 24" stroke="#1a8c3e" strokeWidth="0.6" fill="none" opacity="0.5" />
      <path d="M48 30 Q58 29 68 30" stroke="#1a8c3e" strokeWidth="0.5" fill="none" opacity="0.4" />

      {/* ===== LEGS ===== */}
      <path d="M46 37 L42 47 L45 45 L47 48 L49 45 L48 37" fill="#1a8c3e" stroke={o} strokeWidth="1" />
      <path d="M70 36 L67 46 L70 44 L72 47 L74 44 L73 36" fill="#1a8c3e" stroke={o} strokeWidth="1" />

      {/* ===== HEAD ===== */}
      <ellipse cx="86" cy="24" rx="14" ry="12" fill="#22c55e" stroke={o} strokeWidth="1.5" />
      {/* Snout */}
      <path
        d="M86 16 Q105 12, 130 17 Q132 20, 130 23 Q105 27, 86 24Z"
        fill="#22c55e" stroke={o} strokeWidth="1.5"
      />
      {/* Upper jaw darker */}
      <path d="M88 16 Q106 13, 130 17 Q106 15, 88 18Z" fill="#1a8c3e" />
      {/* Jaw line */}
      <path d="M84 21 Q108 23, 132 20" stroke={o} strokeWidth="1.2" fill="none" />
      {/* Lower jaw */}
      <path d="M86 24 Q105 28, 128 24 Q105 22, 86 23Z" fill="#2dd671" stroke={o} strokeWidth="1" />

      {/* Teeth top */}
      <path d="M100 20 L101.5 23.5 L103 20" fill="white" stroke={o} strokeWidth="0.5" />
      <path d="M108 19 L109.5 22.5 L111 19" fill="white" stroke={o} strokeWidth="0.5" />
      <path d="M116 18.5 L117.5 22 L119 18.5" fill="white" stroke={o} strokeWidth="0.5" />
      <path d="M123 19 L124 22 L125 19" fill="white" stroke={o} strokeWidth="0.5" />
      {/* Teeth bottom */}
      <path d="M104 23 L105.5 20.5 L107 23" fill="white" stroke={o} strokeWidth="0.5" />
      <path d="M112 22.5 L113.5 20 L115 22.5" fill="white" stroke={o} strokeWidth="0.5" />
      <path d="M120 22 L121 20 L122 22" fill="white" stroke={o} strokeWidth="0.5" />

      {/* ===== EYE (raised bump) ===== */}
      <ellipse cx="84" cy="12" rx="5.5" ry="6" fill="#22c55e" stroke={o} strokeWidth="1.5" />
      <circle cx="84" cy="11.5" r="3.5" fill="#f0fdf4" stroke={o} strokeWidth="0.6" />
      <circle cx="84.5" cy="11" r="2.2" fill="#15803d" />
      <circle cx="85" cy="10.5" r="1" fill="#0a0f1a" />
      <circle cx="83.2" cy="10" r="0.8" fill="white" opacity="0.85" />

      {/* Nostrils */}
      <circle cx="129" cy="18" r="1" fill={o} />
      <circle cx="129" cy="22" r="1" fill={o} />
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
