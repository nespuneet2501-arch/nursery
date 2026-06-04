import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, User, Sprout, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

export default function GardenHelper() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "🌿 Namaste! I am your PlantAdda Botanical AI Assistant. Ask me anything about watering frequencies, optimal soil mixes, organic fertilizer recipes, or season-specific crop instructions." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userQuery }]);
    setLoading(true);

    try {
      const chatHistory = messages.slice(-5).map(m => ({
        role: m.role === "user" ? "user" : "model",
        text: m.text
      }));

      const res = await fetch("/api/ai/botanical-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userQuery,
          previousMessages: chatHistory
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: "bot", text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: "bot", text: "⚠️ Botanical server is busy. Here is a quick tip: Always inspect soil dampness before adding water!" }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "bot", text: "⚠️ Server connectivity error. Please try again shortly." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "How often should I water my Peace Lily?",
    "Best organic soil mix ratio for flowering plants?",
    "Why are my lemon tree leaves turning yellow?",
    "When is the best season to sow tomato seeds?"
  ];

  return (
    <div id="ai-helper-section" className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden flex flex-col h-[550px]">
      {/* Header */}
      <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-700/60 p-2 rounded-xl text-emerald-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">AI Care Assistant</h3>
            <p className="text-xs text-emerald-200">Standardized PlantAdda Care Guide</p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([{ role: "bot", text: "🌿 Conversation reset. How can I help with your organic garden today?" }])}
          className="text-emerald-200 hover:text-white transition-colors p-1.5 hover:bg-emerald-700/50 rounded-lg text-xs flex items-center gap-1"
          title="Reset Chat"
        >
          <RefreshCw className="w-4 h-4" /> Reset
        </button>
      </div>

      {/* Message space */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-emerald-50/20">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-2.5 max-w-[85%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            <div className={`p-2 rounded-xl flex-shrink-0 ${
              msg.role === "user" ? "bg-emerald-100 text-emerald-800" : "bg-emerald-800 text-white"
            }`}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Sprout className="w-4 h-4" />}
            </div>
            <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user" 
                ? "bg-emerald-700 text-white rounded-tr-none" 
                : "bg-white text-slate-800 border border-slate-100 shadow-sm rounded-tl-none"
            }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2.5 max-w-[85%]">
            <div className="p-2 rounded-xl flex-shrink-0 bg-emerald-800 text-white">
              <Sprout className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none text-sm bg-white text-slate-500 border border-slate-100 shadow-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="text-xs italic ml-1">Botanist thinking...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested chips if idle */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t border-slate-50 bg-slate-50/50">
          <p className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Common Queries
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(q);
                }}
                className="text-[11px] bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition-all rounded-full px-2.5 py-1 text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer input form */}
      <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-100 bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about fertilizer recipes, leaf disease remedies, watering guide..."
          className="flex-1 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-emerald-800 hover:bg-emerald-950 text-white p-2.5 rounded-xl disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
