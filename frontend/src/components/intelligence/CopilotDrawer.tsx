import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bot,
  Send,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  CornerDownLeft,
  ChevronRight
} from 'lucide-react';
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
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; data?: CopilotResponse }>>([
    {
      sender: 'assistant',
      text: "Hello! I am your StockSense Grounded Copilot. I analyze real-time outbound demand velocities, supplier lead times, and warehouse stock levels to answer your inventory questions. You can type or tap the microphone to speak with me."
    }
  ]);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, isListening]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError('');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setVoiceError(`Voice input error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-To-Speech (TTS)
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !autoSpeak) return;

    window.speechSynthesis.cancel(); // stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setVoiceError('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (query.trim()) {
        handleSend(query);
      }
    } else {
      setVoiceError('');
      setQuery('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Start recognition error:', e);
      }
    }
  };

  const handleSend = async (userText: string) => {
    if (!userText.trim() || loading) return;

    const currentQuery = userText.trim();
    setQuery('');
    setMessages(prev => [...prev, { sender: 'user', text: currentQuery }]);
    setLoading(true);

    try {
      const res: CopilotResponse = await api.queryCopilot({ query: currentQuery });
      setMessages(prev => [...prev, { sender: 'assistant', text: res.answer, data: res }]);
      speakText(res.answer);
    } catch (err: any) {
      const errorMsg = `Error analyzing query: ${err.message || 'Unable to connect to intelligence engine.'}`;
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: errorMsg
        }
      ]);
      speakText(errorMsg);
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
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-black border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-neutral-950">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold shadow-md">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                  AI Inventory Copilot
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono">
                    Grounded
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">LLM: gemini-3.8-flash</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Voice toggle */}
              <button
                type="button"
                onClick={() => {
                  setAutoSpeak(!autoSpeak);
                  if (autoSpeak && window.speechSynthesis) window.speechSynthesis.cancel();
                }}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  autoSpeak
                    ? 'text-zinc-900 dark:text-white bg-zinc-200 dark:bg-zinc-800'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                }`}
                title={autoSpeak ? 'Voice output enabled (click to mute)' : 'Voice output muted (click to enable)'}
                aria-label="Toggle voice output"
              >
                {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                aria-label="Close copilot"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Voice Waveform Live Visualizer Component */}
          <AnimatePresence>
            {(isListening || isSpeaking) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 py-3 bg-zinc-900 dark:bg-neutral-900 border-b border-zinc-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 h-5">
                    {[0.3, 0.7, 1.0, 0.6, 0.4, 0.9, 0.5].map((scale, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scaleY: isListening || isSpeaking ? [0.2, scale * 1.5, 0.3] : 0.2
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6 + i * 0.1,
                          ease: 'easeInOut'
                        }}
                        className={`w-1 rounded-full ${
                          isListening ? 'bg-rose-500' : 'bg-emerald-400'
                        }`}
                        style={{ height: '100%', originY: 0.5 }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-mono text-zinc-300">
                    {isListening ? 'Listening to voice query...' : 'Speaking answer aloud...'}
                  </span>
                </div>

                {isListening && (
                  <button
                    type="button"
                    onClick={() => {
                      if (recognitionRef.current) recognitionRef.current.stop();
                      if (query.trim()) handleSend(query);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white text-black text-[11px] font-bold hover:bg-zinc-200 cursor-pointer"
                  >
                    Done & Query
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice Error notice */}
          {voiceError && (
            <div className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-xs font-mono flex items-center justify-between">
              <span>{voiceError}</span>
              <button
                type="button"
                onClick={() => setVoiceError('')}
                className="text-rose-400 hover:text-rose-300"
              >
                ×
              </button>
            </div>
          )}

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-medium'
                      : 'bg-zinc-100 dark:bg-neutral-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Read aloud button for assistant messages */}
                  {m.sender === 'assistant' && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => speakText(m.text)}
                        className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <Volume2 className="h-3 w-3" />
                        <span>Play Audio</span>
                      </button>

                      {m.data?.is_fallback && (
                        <span className="text-[10px] font-mono text-amber-500">
                          Deterministic Engine
                        </span>
                      )}
                    </div>
                  )}

                  {/* Grounded Recommended Action Chip */}
                  {m.data?.recommended_action && (
                    <div className="mt-3 p-2.5 rounded-xl bg-zinc-200/60 dark:bg-black/60 border border-zinc-300 dark:border-zinc-700/80 space-y-1.5">
                      <div className="text-[10px] font-mono font-bold uppercase text-zinc-600 dark:text-zinc-400">
                        Authorized Action: {m.data.recommended_action.action_type}
                      </div>
                      <div className="text-[11px] text-zinc-800 dark:text-zinc-300 font-semibold">
                        {m.data.recommended_action.target_sku} ({m.data.recommended_action.target_name})
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (m.data?.recommended_action?.action_type.includes('TRANSFER')) {
                            navigate('/operations/transfers');
                          } else if (m.data?.recommended_action?.action_type.includes('REORDER')) {
                            navigate('/operations/receipts');
                          } else {
                            navigate('/intelligence/scenarios');
                          }
                        }}
                        className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-zinc-900 dark:text-white hover:underline cursor-pointer"
                      >
                        <span>Open & Execute in Operational Hub</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-neutral-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Grounding query with live multi-warehouse state...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Starter Chips */}
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-neutral-950/60 overflow-x-auto">
            <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 mb-1.5 uppercase">
              Prompt Starter Chips:
            </div>
            <div className="flex gap-1.5 whitespace-nowrap">
              {starterChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(chip)}
                  disabled={loading || isListening}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Voice & Input Controls */}
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend(query);
              }}
              className="flex items-center gap-2"
            >
              {/* Microphone Voice Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input (Speech-to-Text)'}
                aria-label="Microphone"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={isListening ? 'Listening to voice...' : 'Ask inventory question or command...'}
                disabled={loading}
                className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors"
              />

              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="p-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors cursor-pointer shadow-xs"
                aria-label="Send message"
              >
                <CornerDownLeft className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
