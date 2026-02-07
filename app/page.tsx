"use client";

import { useState, useRef, useEffect } from "react";

/* ───────────────── ICONS (inline SVG) ───────────────── */
const IconBot = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="8.5" cy="16" r="1.5" />
    <circle cx="15.5" cy="16" r="1.5" />
    <path d="M12 2v5M8 7h8" />
  </svg>
);
const IconSend = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5 text-emerald-400">
    <path d="M5 13l4 4L19 7" />
  </svg>
);
const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);
const IconTrendUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
    <path d="M23 6l-9.5 9.5-5-5L1 18" />
    <path d="M17 6h6v6" />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
const IconMinus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path d="M5 12h14" />
  </svg>
);

/* ───────────────── CHAT DEMO DATA ───────────────── */
type Message = { role: "user" | "bot"; text: string };

const CONVERSATIONS: Record<string, Message[]> = {
  "Voir le menu": [
    { role: "user", text: "Je veux voir le menu svp" },
    {
      role: "bot",
      text: "Bien sûr! 🍽️ Voici nos catégories:\n\n🥗 **Entrées** — à partir de 8$\n🍕 **Plats principaux** — à partir de 16$\n🍰 **Desserts** — à partir de 7$\n🍷 **Boissons** — à partir de 4$\n\nQuelle section vous intéresse?",
    },
    { role: "user", text: "Les plats principaux" },
    {
      role: "bot",
      text: "Excellent choix! Voici nos plats principaux:\n\n🥩 **Bavette de boeuf grillée** — 28$\n🍗 **Poulet rôti aux herbes** — 22$\n🐟 **Saumon de l'Atlantique** — 26$\n🍝 **Pâtes au pesto maison** — 18$\n🥘 **Tourtière du Lac** — 20$\n\nVoulez-vous commander?",
    },
  ],
  "Réserver une table": [
    { role: "user", text: "Je voudrais réserver une table" },
    {
      role: "bot",
      text: "Avec plaisir! 📅 Pour quelle date souhaitez-vous réserver?",
    },
    { role: "user", text: "Ce samedi soir, pour 4 personnes" },
    {
      role: "bot",
      text: "Parfait! Samedi soir pour 4 personnes. 🕖 Voici nos disponibilités:\n\n✅ 17h30\n✅ 18h00\n✅ 19h30\n❌ 20h00 (complet)\n✅ 20h30\n\nQuelle heure vous convient?",
    },
    { role: "user", text: "19h30" },
    {
      role: "bot",
      text: "✅ **Réservation confirmée!**\n\n📅 Samedi, 19h30\n👥 4 personnes\n📍 Table près de la fenêtre\n\nVous recevrez un SMS de confirmation. À samedi! 🎉",
    },
  ],
  "Commander pour livraison": [
    { role: "user", text: "Je veux commander pour livraison" },
    {
      role: "bot",
      text: "Super! 🚗 Livraison disponible dans un rayon de 10 km.\n\nQue souhaitez-vous commander?",
    },
    { role: "user", text: "2 poutines classiques et une pizza pepperoni" },
    {
      role: "bot",
      text: "Excellent! Votre commande:\n\n🍟 2x Poutine classique — 28$\n🍕 1x Pizza pepperoni — 18$\n🚗 Frais de livraison — 5$\n\n💰 **Total: 51$ + taxes**\n\nConfirmer et payer?",
    },
    { role: "user", text: "Oui, confirmer!" },
    {
      role: "bot",
      text: "✅ **Commande confirmée!**\n\n⏱️ Temps estimé: **35-45 minutes**\n📱 Suivez votre commande en temps réel\n\nBon appétit! 🎉",
    },
  ],
  "Heures d'ouverture": [
    { role: "user", text: "C'est quoi vos heures d'ouverture?" },
    {
      role: "bot",
      text: "Voici nos heures d'ouverture! 🕐\n\n🗓️ **Lundi - Jeudi:** 11h à 21h\n🗓️ **Vendredi - Samedi:** 11h à 23h\n🗓️ **Dimanche:** 10h à 21h (brunch dès 10h!)\n\n📍 1234 Rue Principale, Montréal\n📞 (514) 555-0123\n\nAutre chose?",
    },
  ],
};

/* ───────────────── CHAT WIDGET ───────────────── */
function ChatWidget({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Bonjour! 👋 Bienvenue chez **Chez Marcel**. Je suis votre assistant IA. Comment puis-je vous aider?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const quickReplies = Object.keys(CONVERSATIONS);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const simulateConversation = async (topic: string) => {
    const convo = CONVERSATIONS[topic];
    if (!convo) return;

    for (const msg of convo) {
      if (msg.role === "user") {
        setMessages((prev) => [...prev, msg]);
        await new Promise((r) => setTimeout(r, 800));
      } else {
        setIsTyping(true);
        await new Promise((r) => setTimeout(r, 1500));
        setIsTyping(false);
        setMessages((prev) => [...prev, msg]);
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  };

  const handleQuickReply = (topic: string) => {
    simulateConversation(topic);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMsg: Message = { role: "user", text: inputValue };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Merci pour votre message! 😊 Dans la version complète, je pourrais répondre à toutes vos questions. Essayez les boutons rapides pour voir une démo!",
        },
      ]);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col z-50 animate-fade-in-up overflow-hidden">
      {/* Header */}
      <div className="gradient-orange p-4 rounded-t-2xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <IconBot />
          </div>
          <div>
            <h3 className="font-bold text-sm">Chez Marcel — Assistant IA</h3>
            <p className="text-xs text-white/80">🟢 En ligne • Répond instantanément</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition"><IconMinus /></button>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition"><IconX /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slide-in-right`}>
            <div className={`max-w-[80%] px-4 py-2.5 text-sm ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"}`}>
              {msg.text.split("\n").map((line, j) => (
                <p key={j} className={j > 0 ? "mt-1" : ""}>
                  {line.split(/(\*\*.*?\*\*)/).map((part, k) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong key={k} className="font-semibold">{part.slice(2, -2)}</strong>
                    ) : (
                      <span key={k}>{part}</span>
                    )
                  )}
                </p>
              ))}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="chat-bubble-bot px-4 py-3 flex gap-1.5">
              <span className="typing-dot w-2 h-2 bg-white/60 rounded-full inline-block" />
              <span className="typing-dot w-2 h-2 bg-white/60 rounded-full inline-block" />
              <span className="typing-dot w-2 h-2 bg-white/60 rounded-full inline-block" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 py-2 border-t border-slate-700/50 shrink-0">
        <div className="flex flex-wrap gap-2">
          {quickReplies.map((label) => (
            <button
              key={label}
              onClick={() => handleQuickReply(label)}
              className="text-xs px-3 py-1.5 rounded-full border border-orange-500/50 text-orange-300 hover:bg-orange-500/20 transition"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-700/50 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Écrivez votre message..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
          />
          <button onClick={handleSend} className="gradient-orange p-2.5 rounded-xl hover:opacity-90 transition">
            <IconSend />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────── MAIN PAGE ───────────────── */
export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "sent">("idle");

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("sent");
    setTimeout(() => setFormStatus("idle"), 4000);
  };

  return (
    <>
      {/* ───── NAV ───── */}
      <nav className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-orange rounded-lg flex items-center justify-center text-sm font-bold">R</div>
            <span className="text-lg font-bold">RestoBot<span className="text-orange-400"> AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <a href="#fonctionnalites" className="hover:text-white transition">Fonctionnalités</a>
            <a href="#demo" className="hover:text-white transition">Démo</a>
            <a href="#tarifs" className="hover:text-white transition">Tarifs</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </div>
          <button onClick={() => setChatOpen(true)} className="gradient-orange px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition">
            Essayer la démo →
          </button>
        </div>
      </nav>

      {/* ───── HERO ───── */}
      <section className="gradient-hero min-h-screen flex items-center relative overflow-hidden pt-20">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center relative">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5 text-sm text-orange-300 mb-6">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              Propulsé par l&apos;intelligence artificielle
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black leading-tight mb-6">
              Votre restaurant,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                disponible 24/7
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed max-w-lg break-words">
              Un chatbot IA qui prend les commandes, gère les réservations et répond aux questions
              de vos clients — automatiquement, en français québécois.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => setChatOpen(true)} className="w-full sm:w-auto gradient-orange px-8 py-4 rounded-xl text-lg font-bold hover:opacity-90 transition pulse-glow">
                Voir la démo en direct →
              </button>
              <a href="#tarifs" className="w-full sm:w-auto text-center border border-slate-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-800 transition">
                Voir les tarifs
              </a>
            </div>
            <div className="flex items-center gap-6 mt-10 text-sm text-slate-400">
              <div className="flex -space-x-2">
                {["🧑‍🍳", "👨‍🍳", "👩‍🍳", "🧑‍🍳"].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-sm">{e}</div>
                ))}
              </div>
              <span>Déjà adopté par <strong className="text-white">50+ restaurants</strong> au Québec</span>
            </div>
          </div>
          <div className="relative hidden lg:block">
            {/* Phone mockup */}
            <div className="float-animation">
              <div className="w-80 mx-auto bg-slate-800 rounded-[3rem] p-3 border border-slate-700 shadow-2xl">
                <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden">
                  <div className="gradient-orange p-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs">🤖</div>
                    <div>
                      <p className="text-sm font-bold">Chez Marcel</p>
                      <p className="text-xs text-white/70">En ligne</p>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 min-h-[300px]">
                    <div className="chat-bubble-bot px-3 py-2 text-xs">Bonjour! 👋 Comment puis-je vous aider?</div>
                    <div className="chat-bubble-user px-3 py-2 text-xs ml-auto max-w-[70%]">Une table pour 2 ce soir?</div>
                    <div className="chat-bubble-bot px-3 py-2 text-xs">Parfait! 19h ou 20h30 disponible ✅</div>
                    <div className="chat-bubble-user px-3 py-2 text-xs ml-auto max-w-[70%]">19h!</div>
                    <div className="chat-bubble-bot px-3 py-2 text-xs">Réservé! À ce soir 🎉</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── STATS ───── */}
      <section className="bg-slate-900/50 border-y border-slate-800/50 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "85%", label: "Réduction des appels" },
            { value: "24/7", label: "Disponibilité" },
            { value: "< 3s", label: "Temps de réponse" },
            { value: "+40%", label: "Commandes en ligne" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-black text-orange-400 mb-2">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section id="fonctionnalites" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Tout ce que votre restaurant a besoin,{" "}
              <span className="text-orange-400">automatisé</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Notre chatbot IA comprend vos clients et gère les tâches répétitives pour que
              vous puissiez vous concentrer sur la cuisine.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <IconChat />,
                title: "Prise de commandes",
                desc: "Commandes en ligne 24/7 via chat. Le bot comprend les modifications, les allergies et les demandes spéciales.",
              },
              {
                icon: <IconCalendar />,
                title: "Réservations",
                desc: "Gestion automatique des tables. Vérification de disponibilité en temps réel et confirmations par SMS.",
              },
              {
                icon: <IconMenu />,
                title: "Menu interactif",
                desc: "Présentation dynamique du menu avec prix, descriptions, photos et suggestions personnalisées.",
              },
              {
                icon: <IconClock />,
                title: "FAQ automatisée",
                desc: "Horaires, allergènes, stationnement, modes de paiement — tout est répondu instantanément.",
              },
              {
                icon: <IconTrendUp />,
                title: "Analytiques",
                desc: "Tableau de bord complet: questions fréquentes, heures de pointe, produits populaires.",
              },
              {
                icon: <IconShield />,
                title: "Français québécois",
                desc: "Entraîné avec le français du Québec. Comprend les expressions locales et le joual.",
              },
            ].map((feat) => (
              <div key={feat.title} className="glass-card rounded-2xl p-8 hover:border-orange-500/30 transition group">
                <div className="w-14 h-14 gradient-orange rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── DEMO SECTION ───── */}
      <section id="demo" className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Essayez-le <span className="text-orange-400">maintenant</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Cliquez sur le bouton ci-dessous pour ouvrir le chatbot et tester les fonctionnalités en temps réel.
            </p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => setChatOpen(true)}
              className="group relative gradient-orange px-12 py-6 rounded-2xl text-xl font-bold hover:opacity-90 transition pulse-glow"
            >
              <span className="flex items-center gap-3">
                💬 Lancer la démo interactive
                <svg className="w-6 h-6 group-hover:translate-x-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {["Voir le menu", "Réserver une table", "Commander pour livraison", "Heures d'ouverture"].map((item) => (
              <button
                key={item}
                onClick={() => { setChatOpen(true); }}
                className="glass-card rounded-xl p-4 text-center text-sm hover:border-orange-500/30 transition cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Prêt en <span className="text-orange-400">3 étapes</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Configuration",
                desc: "Envoyez-nous votre menu, horaires et informations. On configure tout en 48h.",
              },
              {
                step: "02",
                title: "Intégration",
                desc: "Un simple widget à ajouter sur votre site web. Compatible avec toutes les plateformes.",
              },
              {
                step: "03",
                title: "C'est parti!",
                desc: "Votre chatbot est en ligne. Suivez les performances via votre tableau de bord.",
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="text-6xl font-black text-orange-500/20 mb-4">{s.step}</div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── TESTIMONIALS ───── */}
      <section className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Ce que nos clients <span className="text-orange-400">disent</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                name: "Marie-Claire Tremblay",
                role: "Propriétaire, Bistro Le Québécois",
                text: "On a réduit nos appels téléphoniques de 70%. Les clients adorent pouvoir réserver et commander directement via le chat!",
              },
              {
                name: "Jean-François Gagnon",
                role: "Gérant, Pizza Montréal",
                text: "Les commandes en ligne ont augmenté de 45% dès le premier mois. Le bot comprend même quand les clients écrivent en joual!",
              },
              {
                name: "Sophie Lavoie",
                role: "Chef, Restaurant La Belle Province",
                text: "L'installation a pris 30 minutes. Le support est exceptionnel et le bot s'améliore constamment. Je le recommande à 100%.",
              },
            ].map((t) => (
              <div key={t.name} className="glass-card rounded-2xl p-8">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <IconStar key={s} />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gradient-orange rounded-full flex items-center justify-center font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PRICING ───── */}
      <section id="tarifs" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Tarifs <span className="text-orange-400">transparents</span>
            </h2>
            <p className="text-lg text-slate-400">Pas de frais cachés. Annulez quand vous voulez.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Essentiel",
                setup: "500$",
                monthly: "99$/mois",
                features: [
                  "Chatbot FAQ",
                  "Horaires & infos",
                  "Menu interactif",
                  "Support par email",
                  "Widget personnalisé",
                ],
                highlighted: false,
              },
              {
                name: "Professionnel",
                setup: "1 200$",
                monthly: "199$/mois",
                features: [
                  "Tout de Essentiel +",
                  "Réservations en ligne",
                  "Commandes & paiements",
                  "Notifications SMS",
                  "Tableau de bord",
                  "Support prioritaire",
                ],
                highlighted: true,
              },
              {
                name: "Entreprise",
                setup: "2 000$",
                monthly: "299$/mois",
                features: [
                  "Tout de Professionnel +",
                  "Multi-succursales",
                  "API personnalisée",
                  "Intégration POS",
                  "Analytiques avancées",
                  "Gestionnaire dédié",
                ],
                highlighted: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border ${
                  plan.highlighted
                    ? "border-orange-500 bg-gradient-to-b from-orange-500/10 to-transparent scale-105"
                    : "border-slate-700/50 glass-card"
                } transition hover:border-orange-500/50`}
              >
                {plan.highlighted && (
                  <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-4">⭐ Plus populaire</div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-1">
                  <span className="text-4xl font-black text-orange-400">{plan.monthly.split("/")[0]}</span>
                  <span className="text-slate-400">/mois</span>
                </div>
                <p className="text-sm text-slate-400 mb-6">+ {plan.setup} frais d&apos;installation</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <IconCheck /> <span className="text-slate-300">{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className={`block text-center py-3 rounded-xl font-semibold transition ${
                    plan.highlighted
                      ? "gradient-orange hover:opacity-90"
                      : "border border-slate-600 hover:bg-slate-800"
                  }`}
                >
                  Commencer
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CONTACT / CTA ───── */}
      <section id="contact" className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
                Prêt à <span className="text-orange-400">automatiser</span> votre restaurant?
              </h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Contactez-nous pour une démo personnalisée. Notre équipe vous répond en moins de 24 heures.
              </p>
              <div className="space-y-4 text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📧</span>
                  <a href="mailto:alex@perroquet.io" className="hover:text-orange-400 transition">alex@perroquet.io</a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌐</span>
                  <span>perroquet.io</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">📍</span>
                  <span>Montréal, Québec</span>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-8">
              {formStatus === "sent" ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold mb-2">Message envoyé!</h3>
                  <p className="text-slate-400">Nous vous répondrons sous 24 heures.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <h3 className="text-xl font-bold mb-2">Demander une démo gratuite</h3>
                  <input
                    type="text"
                    placeholder="Nom du restaurant"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
                  />
                  <input
                    type="email"
                    placeholder="Votre courriel"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
                  />
                  <input
                    type="tel"
                    placeholder="Téléphone (optionnel)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition"
                  />
                  <textarea
                    placeholder="Parlez-nous de votre restaurant..."
                    rows={4}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition resize-none"
                  />
                  <button type="submit" className="w-full gradient-orange py-3 rounded-xl font-bold hover:opacity-90 transition">
                    Envoyer la demande →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="border-t border-slate-800/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-orange rounded-lg flex items-center justify-center text-sm font-bold">R</div>
              <span className="font-bold">RestoBot AI</span>
              <span className="text-slate-500 text-sm">par Perroquet</span>
            </div>
            <p className="text-sm text-slate-500">© 2025 Perroquet. Tous droits réservés.</p>
            <div className="flex gap-6 text-sm text-slate-400">
              <a href="mailto:alex@perroquet.io" className="hover:text-white transition">Contact</a>
              <span>Montréal, QC 🇨🇦</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ───── FLOATING CHAT BUTTON ───── */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 gradient-orange rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition z-50 pulse-glow"
        >
          <IconChat />
        </button>
      )}

      {/* ───── CHAT WIDGET ───── */}
      <ChatWidget isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
