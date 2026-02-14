export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  hours: Record<string, { open: string; close: string }> | null;
  bot_personality: string | null;
  owner_id: string | null;
  stripe_customer_id: string | null;
  plan: 'starter' | 'pro' | 'enterprise';
  created_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category: string;
  name: string;
  description: string | null;
  price: number;
  available: boolean;
  created_at: string;
}

export interface Reservation {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  date: string;
  time: string;
  party_size: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  conversation_id: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  restaurant_id: string;
  session_id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}
