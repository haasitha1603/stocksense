import React, { useState } from 'react';
import { X, Bot, Send, Sparkles, AlertTriangle, ArrowRight, CornerDownLeft } from 'lucide-react';
import { api } from '../../services/api';
import { CopilotResponse } from '../../types';
import { useNavigate } from 'react-router-dom';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; data?: CopilotResponse }>>([
    {
      sender: 'assistant',
      text: "Hello! I am your StockSense Grounded Copilot. I analyze real-time outbound demand velocities, supplier lead times, and warehouse stock levels to answer your inventory questions. How can I assist you today?"
    }
  ]);
  const navigate = useNavigate();

  const handleSend = async (userText: string) => {
    if (!userText.trim() || loading) return;

    const currentQuery = userText.trim();
    setQuery('');
    setMessages(prev => [...prev, { sender: 'user', text: currentQuery }]);
    setLoading(true);

    try {
      const res: CopilotResponse = await api.queryCopilot({ query: currentQuery });
      setMessages(prev => [...prev, { sender: 'assistant', text: res.answer, data: res }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: `Error analyzing query: ${err.message || 'Unable to connect to intelligence engine.'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const starterChips = [
    "Which products are at critical stockout risk?",
    "What warehouse transfers are recommended?",
    "What should I reorder this week?",
    "Give me an executive inventory health summary"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  AI Inventory Copilot
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                    Grounded
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">LLM: gemini-3.8-flash (via Google GenAI)</div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close copilot"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl p-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  {m.text}

                  {m.data?.suggested_actions && m.data.suggested_actions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Suggested Next Steps:
                      </div>
                      {m.data.suggested_actions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          type="button"
                          onClick={() => {
                            onClose();
                            navigate(act.target);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-medium transition-colors text-left"
                        >
                          <span className="truncate">{act.label}</span>
                          <ArrowRight className="h-3 w-3 shrink-0 ml-1" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-slate-400 text-xs py-2">
                <div className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                <span>Copilot is calculating live demand velocity and stock coverage...</span>
              </div>
            )}
          </div>

          {/* Quick starter chips */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-wrap gap-1.5">
            {starterChips.map((chip, chipIdx) => (
              <button
                key={chipIdx}
                type="button"
                onClick={() => handleSend(chip)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-950 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Query Input */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend(query);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask about risks, reorders, or transfers..."
                className="flex-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors cursor-pointer"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
