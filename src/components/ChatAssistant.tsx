import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Wrench,
  Bot,
  Zap,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Minimize2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  quickAction?: {
    label: string;
    actionTab: string;
  };
}

interface ChatAssistantProps {
  onNavigateTab: (tab: string) => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ onNavigateTab }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your Craft & Care AI Assistant. Ask me anything about tool equipment specs, stock availability, deposit refund formulas, or booking certified technicians!',
      timestamp: 'Just now'
    }
  ]);

  const quickPrompts = [
    'Which drills are available for concrete masonry?',
    'How does the security deposit refund formula work?',
    'Can I book AC repair with Muthu Vel?',
    'What are the pressure washer rates and specs?'
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setHasInteracted(true);
    setInputMessage('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.reply || "I'm here to help with all tool rentals and home services.";

      // Determine quick action tag based on content
      let quickAction: ChatMessage['quickAction'] = undefined;
      const lower = text.toLowerCase() + ' ' + replyText.toLowerCase();
      if (lower.includes('drill') || lower.includes('washer') || lower.includes('saw') || lower.includes('tool') || lower.includes('generator')) {
        quickAction = { label: 'Explore Tools Fleet', actionTab: 'tools' };
      } else if (lower.includes('ac') || lower.includes('electric') || lower.includes('plumb') || lower.includes('service') || lower.includes('muthu')) {
        quickAction = { label: 'View Household Services', actionTab: 'services' };
      } else if (lower.includes('deposit') || lower.includes('late fee') || lower.includes('refund')) {
        quickAction = { label: 'Open Deposit Calculator', actionTab: 'calculator' };
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickAction
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Our equipment inventory service is currently active. You can browse all tools in the Tools Catalog or schedule a technician in the Services tab.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickAction: { label: 'Browse Tools Fleet', actionTab: 'tools' }
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON (FAB) */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-bold text-xs shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-500/30"
            aria-label="Open AI Assistant"
          >
            <div className="w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center text-amber-400 group-hover:rotate-12 transition-transform">
              <Sparkles className="w-3.5 h-3.5" />
            </div>

            <span className="text-white font-extrabold tracking-tight">
              Ask AI Assistant
            </span>

            {/* Glowing Pulse Indicator */}
            <span className="relative flex h-2.5 w-2.5 ml-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
          </button>
        )}
      </div>

      {/* CHAT WINDOW INTERFACE */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[420px] max-w-[calc(100vw-32px)] h-[560px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-white">Craft & Care AI</h3>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Tool Availability & Service Advisor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Quick Action Button attached to Assistant messages */}
                {msg.quickAction && (
                  <button
                    onClick={() => {
                      onNavigateTab(msg.quickAction!.actionTab);
                      setIsOpen(false);
                    }}
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors self-start"
                  >
                    <span>{msg.quickAction.label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                <span className="text-[9px] text-slate-400 mt-0.5 px-1 font-num">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs bg-white border border-slate-200 px-3 py-2 rounded-2xl rounded-bl-xs w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] font-medium text-slate-500 ml-1">
                  Checking catalog & specs...
                </span>
              </div>
            )}

            {/* Quick Suggested Prompts (when starting out) */}
            {!hasInteracted && messages.length <= 1 && (
              <div className="pt-2 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Suggested Questions
                </span>
                <div className="space-y-1.5">
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(prompt)}
                      className="w-full text-left p-2 rounded-xl bg-white hover:bg-amber-50 hover:text-amber-900 border border-slate-200/80 text-[11px] font-medium text-slate-700 transition-colors shadow-2xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="Ask about drills, washers, deposits..."
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all disabled:opacity-40 disabled:hover:bg-amber-500 shadow-xs"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="text-[10px] text-slate-600 text-center mt-1.5">
              Powered by Gemini · Tool specs & booking intelligence
            </div>
          </div>

        </div>
      )}
    </>
  );
};
