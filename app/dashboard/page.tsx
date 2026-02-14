"use client";

import { useState, useEffect, useCallback } from "react";

type Tab = "reservations" | "menu" | "conversations" | "settings";

interface Reservation {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  date: string;
  time: string;
  party_size: number;
  status: string;
  notes: string;
  created_at: string;
}

interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
}

interface ConvoMessage {
  role: string;
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  session_id: string;
  messages: ConvoMessage[];
  created_at: string;
  updated_at: string;
}

interface Restaurant {
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: Record<string, { open: string; close: string }>;
  bot_personality: string;
  plan: string;
}

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("reservations");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resRes, menuRes, convoRes, restRes] = await Promise.all([
        fetch("/api/reservations?restaurant=chez-marcel"),
        fetch("/api/menu?restaurant=chez-marcel"),
        fetch("/api/admin/conversations?restaurant=chez-marcel"),
        fetch("/api/admin/restaurant?slug=chez-marcel"),
      ]);
      const [resData, menuData, convoData, restData] = await Promise.all([
        resRes.json(),
        menuRes.json(),
        convoRes.json(),
        restRes.json(),
      ]);
      setReservations(resData.reservations || []);
      setMenuItems(menuData.items || []);
      setConversations(convoData.conversations || []);
      setRestaurant(restData.restaurant || null);
    } catch (e) {
      console.error("Error loading data:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateReservationStatus = async (id: string, status: string) => {
    await fetch("/api/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadData();
  };

  const toggleMenuAvailability = async (id: string, available: boolean) => {
    await fetch("/api/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, available: !available }),
    });
    loadData();
  };

  const deleteMenuItem = async (id: string) => {
    if (!confirm("Supprimer cet item?")) return;
    await fetch(`/api/menu?id=${id}`, { method: "DELETE" });
    loadData();
  };

  const saveSettings = async (updates: Partial<Restaurant>) => {
    await fetch("/api/admin/restaurant", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "chez-marcel", ...updates }),
    });
    loadData();
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "reservations", label: "Réservations", icon: "📅" },
    { id: "menu", label: "Menu", icon: "🍽️" },
    { id: "conversations", label: "Conversations", icon: "💬" },
    { id: "settings", label: "Paramètres", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-sm font-bold">
              R
            </div>
            <div>
              <h1 className="font-bold">RestoBot AI — Tableau de bord</h1>
              <p className="text-xs text-slate-400">{restaurant?.name || "Chargement..."}</p>
            </div>
          </div>
          <a href="/" className="text-sm text-slate-400 hover:text-white transition">
            ← Retour au site
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                tab === t.id
                  ? "bg-orange-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <span>{t.icon}</span> {t.label}
              {t.id === "reservations" && reservations.filter(r => r.status === "confirmed").length > 0 && (
                <span className="bg-red-500 text-xs px-2 py-0.5 rounded-full">
                  {reservations.filter(r => r.status === "confirmed").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Chargement...</div>
        ) : (
          <>
            {/* RESERVATIONS */}
            {tab === "reservations" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">📅 Réservations</h2>
                {reservations.length === 0 ? (
                  <div className="bg-slate-900 rounded-xl p-12 text-center text-slate-400">
                    Aucune réservation pour le moment.
                    <br />
                    <span className="text-sm">Les réservations faites via le chatbot apparaîtront ici.</span>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {reservations.map((r) => (
                      <div
                        key={r.id}
                        className="bg-slate-900 rounded-xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-lg">{r.customer_name}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                r.status === "confirmed"
                                  ? "bg-green-500/20 text-green-400"
                                  : r.status === "cancelled"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-slate-500/20 text-slate-400"
                              }`}
                            >
                              {r.status === "confirmed" ? "✅ Confirmée" : r.status === "cancelled" ? "❌ Annulée" : "✔️ Complétée"}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                            <span>📅 {r.date}</span>
                            <span>🕐 {r.time}</span>
                            <span>👥 {r.party_size} personnes</span>
                            {r.customer_phone && <span>📞 {r.customer_phone}</span>}
                          </div>
                          {r.notes && <p className="text-sm text-slate-500 mt-1">📝 {r.notes}</p>}
                        </div>
                        {r.status === "confirmed" && (
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => updateReservationStatus(r.id, "completed")}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition"
                            >
                              Compléter
                            </button>
                            <button
                              onClick={() => updateReservationStatus(r.id, "cancelled")}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition"
                            >
                              Annuler
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MENU */}
            {tab === "menu" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">🍽️ Menu</h2>
                  <AddMenuItemForm
                    onAdd={loadData}
                    restaurantSlug="chez-marcel"
                  />
                </div>
                {Object.entries(
                  menuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
                    if (!acc[item.category]) acc[item.category] = [];
                    acc[item.category].push(item);
                    return acc;
                  }, {})
                ).map(([category, items]) => (
                  <div key={category} className="mb-8">
                    <h3 className="text-lg font-bold text-orange-400 mb-3">{category}</h3>
                    <div className="grid gap-3">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className={`bg-slate-900 rounded-xl p-4 border border-slate-800 flex items-center justify-between ${
                            !item.available ? "opacity-50" : ""
                          }`}
                        >
                          <div>
                            <span className="font-semibold">{item.name}</span>
                            <span className="text-orange-400 ml-3">{item.price}$</span>
                            {item.description && (
                              <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleMenuAvailability(item.id, item.available)}
                              className={`px-3 py-1.5 rounded-lg text-xs transition ${
                                item.available
                                  ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                                  : "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                              }`}
                            >
                              {item.available ? "Disponible" : "Indisponible"}
                            </button>
                            <button
                              onClick={() => deleteMenuItem(item.id)}
                              className="px-3 py-1.5 rounded-lg text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CONVERSATIONS */}
            {tab === "conversations" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">💬 Conversations récentes</h2>
                {conversations.length === 0 ? (
                  <div className="bg-slate-900 rounded-xl p-12 text-center text-slate-400">
                    Aucune conversation encore.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {conversations.map((c) => {
                      const msgs = (c.messages || []) as ConvoMessage[];
                      const userMsgCount = msgs.filter((m) => m.role === "user").length;
                      const lastMsg = msgs[msgs.length - 1];
                      return (
                        <details key={c.id} className="bg-slate-900 rounded-xl border border-slate-800">
                          <summary className="p-4 cursor-pointer hover:bg-slate-800/50 transition rounded-xl">
                            <div className="inline-flex items-center gap-4">
                              <span className="text-sm text-slate-400">
                                {new Date(c.updated_at).toLocaleString("fr-CA")}
                              </span>
                              <span className="text-sm">{userMsgCount} messages client</span>
                              {lastMsg && (
                                <span className="text-sm text-slate-500 truncate max-w-xs">
                                  {lastMsg.content.substring(0, 60)}...
                                </span>
                              )}
                            </div>
                          </summary>
                          <div className="px-4 pb-4 space-y-2 border-t border-slate-800 pt-3">
                            {msgs.filter(m => m.role !== 'system').map((m, i) => (
                              <div
                                key={i}
                                className={`text-sm p-3 rounded-lg ${
                                  m.role === "user"
                                    ? "bg-orange-500/10 text-orange-200 ml-8"
                                    : "bg-slate-800 text-slate-300 mr-8"
                                }`}
                              >
                                <span className="text-xs text-slate-500 block mb-1">
                                  {m.role === "user" ? "👤 Client" : "🤖 Bot"}
                                </span>
                                {m.content}
                              </div>
                            ))}
                          </div>
                        </details>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS */}
            {tab === "settings" && restaurant && (
              <SettingsPanel restaurant={restaurant} onSave={saveSettings} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Add Menu Item Form ── */
function AddMenuItemForm({ onAdd, restaurantSlug }: { onAdd: () => void; restaurantSlug: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: "", name: "", description: "", price: "" });

  const handleSubmit = async () => {
    // Get restaurant ID first
    const res = await fetch(`/api/admin/restaurant?slug=${restaurantSlug}`);
    const { restaurant } = await res.json();
    if (!restaurant) return;

    await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurant_id: restaurant.id,
        category: form.category,
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
      }),
    });
    setForm({ category: "", name: "", description: "", price: "" });
    setOpen(false);
    onAdd();
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm transition">
        + Ajouter un item
      </button>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-wrap gap-3 items-end">
      <input placeholder="Catégorie" value={form.category} onChange={e => setForm({...form, category: e.target.value})}
        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm w-32" />
      <input placeholder="Nom" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm w-40" />
      <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm w-48" />
      <input placeholder="Prix" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm w-20" />
      <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition">Ajouter</button>
      <button onClick={() => setOpen(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition">Annuler</button>
    </div>
  );
}

/* ── Settings Panel ── */
function SettingsPanel({ restaurant, onSave }: { restaurant: Restaurant; onSave: (u: Partial<Restaurant>) => void }) {
  const [form, setForm] = useState({
    name: restaurant.name || "",
    address: restaurant.address || "",
    phone: restaurant.phone || "",
    email: restaurant.email || "",
    bot_personality: restaurant.bot_personality || "",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">⚙️ Paramètres</h2>
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-5 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Nom du restaurant</label>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Adresse</label>
          <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Téléphone</label>
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Personnalité du bot</label>
          <textarea value={form.bot_personality} onChange={e => setForm({...form, bot_personality: e.target.value})}
            rows={4} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm resize-none" />
          <p className="text-xs text-slate-500 mt-1">Instructions personnalisées pour le chatbot IA</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-semibold transition">
            Sauvegarder
          </button>
          {saved && <span className="text-green-400 text-sm">✅ Sauvegardé!</span>}
        </div>
        <div className="mt-6 pt-6 border-t border-slate-800">
          <p className="text-sm text-slate-400">
            Plan actuel: <span className="text-orange-400 font-semibold capitalize">{restaurant.plan}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
