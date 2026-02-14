"use client";

import { useState, useRef, useEffect } from "react";

export default function WidgetChat() {
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Bonjour! 👋 Comment puis-je vous aider?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [convoId, setConvoId] = useState<string | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Get restaurant slug from URL
  const getSlug = () => {
    if (typeof window === "undefined") return "chez-marcel";
    const params = new URLSearchParams(window.location.search);
    return params.get("restaurant") || "chez-marcel";
  };

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages((p) => [...p, { role: "user", text }]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          restaurantSlug: getSlug(),
          sessionId,
          conversationId: convoId,
        }),
      });
      const data = await res.json();
      setTyping(false);
      if (data.reply) {
        setMessages((p) => [...p, { role: "bot", text: data.reply }]);
        if (data.conversationId) setConvoId(data.conversationId);
      }
    } catch {
      setTyping(false);
      setMessages((p) => [...p, { role: "bot", text: "Erreur de connexion. Réessayez!" }]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <div className="shrink-0 p-4" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">🤖</div>
          <div>
            <p className="font-bold text-sm">Assistant IA</p>
            <p className="text-xs text-white/70">🟢 En ligne</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 rounded-[20px_20px_4px_20px]"
                  : "bg-white/10 rounded-[20px_20px_20px_4px]"
              }`}
            >
              {m.text.split("\n").map((line, j) => (
                <p key={j} className={j > 0 ? "mt-1" : ""}>
                  {line.split(/(\*\*.*?\*\*)/).map((part, k) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong key={k}>{part.slice(2, -2)}</strong>
                    ) : (
                      <span key={k}>{part}</span>
                    )
                  )}
                </p>
              ))}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-[20px_20px_20px_4px] px-4 py-3 text-sm text-white/60">
              ● ● ●
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick replies */}
      <div className="px-4 py-2 flex flex-wrap gap-2">
        {["Menu", "Réserver", "Horaires"].map((q) => (
          <button
            key={q}
            onClick={() => send(q === "Menu" ? "Montre-moi le menu" : q === "Réserver" ? "Je veux réserver" : "Vos horaires?")}
            className="text-xs px-3 py-1.5 rounded-full border border-orange-500/50 text-orange-300 hover:bg-orange-500/20 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="shrink-0 p-3 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Écrivez votre message..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={() => send(input)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
