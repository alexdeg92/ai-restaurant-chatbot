import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getRestaurantContext(slug: string) {
  const { data: restaurant } = await supabaseAdmin
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!restaurant) return null;

  const { data: menuItems } = await supabaseAdmin
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .eq('available', true)
    .order('category');

  // Get today's reservations to know availability
  const today = new Date().toISOString().split('T')[0];
  const { data: todayReservations } = await supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .eq('date', today)
    .eq('status', 'confirmed');

  return { restaurant, menuItems: menuItems || [], todayReservations: todayReservations || [] };
}

function buildSystemPrompt(ctx: Awaited<ReturnType<typeof getRestaurantContext>>) {
  if (!ctx) {
    return `Tu es un assistant de restaurant IA. Tu parles en français québécois naturel et chaleureux. Tu ne connais pas encore le restaurant - demande à l'utilisateur quel restaurant il cherche.`;
  }

  const { restaurant, menuItems, todayReservations } = ctx;
  const menuByCategory: Record<string, typeof menuItems> = {};
  menuItems.forEach(item => {
    if (!menuByCategory[item.category]) menuByCategory[item.category] = [];
    menuByCategory[item.category].push(item);
  });

  const menuText = Object.entries(menuByCategory)
    .map(([cat, items]) => `\n**${cat}:**\n${items.map(i => `- ${i.name}: ${i.price}$ ${i.description ? `(${i.description})` : ''}`).join('\n')}`)
    .join('\n');

  const hoursText = restaurant.hours
    ? Object.entries(restaurant.hours as Record<string, { open: string; close: string }>)
        .map(([day, h]) => `${day}: ${h.open} - ${h.close}`)
        .join('\n')
    : 'Non disponible';

  const reservedSlots = todayReservations.map((r: { time: string }) => r.time);

  return `${restaurant.bot_personality || 'Tu es un assistant de restaurant chaleureux et professionnel.'}

INFORMATIONS DU RESTAURANT:
- Nom: ${restaurant.name}
- Adresse: ${restaurant.address || 'Non spécifiée'}
- Téléphone: ${restaurant.phone || 'Non spécifié'}
- Email: ${restaurant.email || 'Non spécifié'}

HORAIRES:
${hoursText}

MENU:
${menuText}

RÉSERVATIONS AUJOURD'HUI (créneaux déjà pris): ${reservedSlots.length > 0 ? reservedSlots.join(', ') : 'Aucune'}

INSTRUCTIONS:
- Réponds toujours en français québécois naturel et chaleureux
- Utilise des émojis avec modération pour rendre la conversation vivante
- Pour les réservations, demande: date, heure, nombre de personnes, nom et téléphone
- Quand tu as TOUTES les infos de réservation, réponds avec un bloc JSON comme ceci (le système le détectera automatiquement):
  RESERVATION_DATA:{"customer_name":"Nom","customer_phone":"514-555-0000","date":"2025-03-15","time":"19:00","party_size":4,"notes":""}
- Pour le menu, présente les items de façon attrayante avec les prix
- Si on te demande quelque chose hors contexte du restaurant, ramène poliment la conversation
- Sois concis mais amical. Pas de réponses trop longues.
- La date d'aujourd'hui est: ${new Date().toISOString().split('T')[0]}`;
}

export async function POST(req: NextRequest) {
  try {
    const { message, restaurantSlug = 'chez-marcel', sessionId, conversationId } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    // Get restaurant context
    const ctx = await getRestaurantContext(restaurantSlug);
    const systemPrompt = buildSystemPrompt(ctx);

    // Load or create conversation
    let convoId = conversationId;
    let previousMessages: { role: string; content: string }[] = [];

    if (convoId) {
      const { data: convo } = await supabaseAdmin
        .from('conversations')
        .select('messages')
        .eq('id', convoId)
        .single();
      if (convo?.messages) {
        previousMessages = (convo.messages as { role: string; content: string }[]).slice(-20); // Last 20 messages for context
      }
    }

    // Build messages array for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...previousMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 800,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu répondre. Réessayez!';

    // Check if reply contains reservation data
    let reservationCreated = null;
    const reservationMatch = reply.match(/RESERVATION_DATA:(\{[^}]+\})/);
    if (reservationMatch && ctx) {
      try {
        const resData = JSON.parse(reservationMatch[1]);
        const { data: newRes } = await supabaseAdmin
          .from('reservations')
          .insert({
            restaurant_id: ctx.restaurant.id,
            customer_name: resData.customer_name,
            customer_phone: resData.customer_phone || null,
            customer_email: resData.customer_email || null,
            date: resData.date,
            time: resData.time,
            party_size: resData.party_size || 2,
            notes: resData.notes || null,
            conversation_id: convoId || null,
            status: 'confirmed',
          })
          .select()
          .single();
        reservationCreated = newRes;
      } catch {
        // Silently fail reservation parsing
      }
    }

    // Clean the reply (remove RESERVATION_DATA block from visible response)
    const cleanReply = reply.replace(/RESERVATION_DATA:\{[^}]+\}/, '').trim();

    // Save conversation
    const now = new Date().toISOString();
    const newMessages = [
      ...previousMessages,
      { role: 'user', content: message, timestamp: now },
      { role: 'assistant', content: cleanReply, timestamp: now },
    ];

    if (convoId) {
      await supabaseAdmin
        .from('conversations')
        .update({ messages: newMessages, updated_at: now })
        .eq('id', convoId);
    } else if (ctx) {
      const { data: newConvo } = await supabaseAdmin
        .from('conversations')
        .insert({
          restaurant_id: ctx.restaurant.id,
          session_id: sessionId || crypto.randomUUID(),
          messages: newMessages,
        })
        .select()
        .single();
      convoId = newConvo?.id;
    }

    return NextResponse.json({
      reply: cleanReply,
      conversationId: convoId,
      reservationCreated,
    });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const errMsg = error instanceof Error ? error.message : 'Erreur interne';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
