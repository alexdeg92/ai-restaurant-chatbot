-- RestoBot AI - Supabase Schema
-- Run this in your Supabase SQL editor

-- Restaurants
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  hours JSONB DEFAULT '{
    "lundi": {"open": "11:00", "close": "21:00"},
    "mardi": {"open": "11:00", "close": "21:00"},
    "mercredi": {"open": "11:00", "close": "21:00"},
    "jeudi": {"open": "11:00", "close": "21:00"},
    "vendredi": {"open": "11:00", "close": "23:00"},
    "samedi": {"open": "11:00", "close": "23:00"},
    "dimanche": {"open": "10:00", "close": "21:00"}
  }'::jsonb,
  bot_personality TEXT DEFAULT 'Vous êtes un assistant de restaurant chaleureux et professionnel. Vous parlez en français québécois naturel. Vous aidez les clients avec le menu, les réservations et les questions générales.',
  owner_id TEXT,
  stripe_customer_id TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  party_size INTEGER NOT NULL DEFAULT 2,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  notes TEXT,
  conversation_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_menu_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant ON reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_conversations_restaurant ON conversations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);

-- Demo restaurant seed
INSERT INTO restaurants (name, slug, description, address, phone, email) VALUES
  ('Chez Marcel', 'chez-marcel', 'Restaurant québécois traditionnel au cœur de Montréal', '1234 Rue Principale, Montréal, QC', '(514) 555-0123', 'info@chezmarcel.ca')
ON CONFLICT (slug) DO NOTHING;

-- Demo menu
INSERT INTO menu_items (restaurant_id, category, name, description, price) VALUES
  ((SELECT id FROM restaurants WHERE slug = 'chez-marcel'), 'Entrées', 'Soupe à l''oignon gratinée', 'Classique française avec croûton et gruyère fondant', 9.00),
  ((SELECT id FROM restaurants WHERE slug = 'chez-marcel'), 'Entrées', 'Salade César', 'Laitue romaine, croûtons maison, parmesan', 12.00),
  ((SELECT id FROM restaurants WHERE slug = 'chez-marcel'), 'Entrées', 'Tartare de saumon', 'Saumon frais, câpres, échalotes, croustilles de wonton', 16.00),
  ((SELECT id FROM restaurants WHERE slug = 'chez-marcel'), 'Plats principaux', 'Bavette de boeuf grillée', 'Coupe AAA, frites maison, sauce au poivre', 28.00),
  ((SELECT id FROM restaurants WHERE slug = 'chez-marcel'), 'Plats principaux', 'Poulet rôti aux herbes', 'Demi-poulet, légumes de saison, jus de rôti', 22.00),
  ((SELECT id FROM restaurants WHERE slug = 'chez-marcel'), 'Plats principaux', 'Saumon de l''Atlantique', 'Filet grillé, risotto aux champignons, beurre citronné', 26.00),
  ((SELECT id FROM restaurants WHERE slug = 'chez-marcel'), 'Plats principaux', 'Pâtes au pesto maison', 'Linguine, pesto de basilic frais, tomates cerises', 18.00),
  ((SELECT id FROM restaurants WHERE slug = 'chez-marcel'), 'Plats principaux', 'Tourtière du Lac', 'Recette traditionnelle, ketchup aux fruits maison', 20.00),
  ((SELECT id FROM restaurants WHERE slug = 'chez-marcel'), 'Desserts', 'Pouding chômeur', 'Classique québécois au sirop d''érable', 10.00),
  ((SELECT id FROM restaurants WHERE slug = 'chez-marcel'), 'Desserts', 'Crème brûlée à l''érable', 'Onctueuse et caramélisée', 9.00),
  ((SELECT id FROM restaurants WHERE slug = 'chez-marcel'), 'Desserts', 'Tarte aux bleuets', 'Bleuets du Lac-Saint-Jean, croûte beurre', 8.00),
  ((SELECT id FROM restaurants WHERE slug = 'chez-marcel'), 'Boissons', 'Bière locale en fût', 'Sélection de microbrasseries québécoises', 8.00),
  ((SELECT id FROM restaurants WHERE slug = 'chez-marcel'), 'Boissons', 'Vin rouge maison', 'Verre de 6oz', 10.00),
  ((SELECT id FROM restaurants WHERE slug = 'chez-marcel'), 'Boissons', 'Café filtre', 'Torréfaction locale', 4.00),
  ((SELECT id FROM restaurants WHERE slug = 'chez-marcel'), 'Boissons', 'Limonade maison', 'Citron frais et menthe', 5.00)
ON CONFLICT DO NOTHING;

-- Enable RLS (optional - adjust policies as needed)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read restaurants" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Public read menu" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public insert reservations" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read reservations" ON reservations FOR SELECT USING (true);
CREATE POLICY "Public manage conversations" ON conversations FOR ALL USING (true);
CREATE POLICY "Public update reservations" ON reservations FOR UPDATE USING (true);
CREATE POLICY "Public manage menu" ON menu_items FOR ALL USING (true);
CREATE POLICY "Public manage restaurants" ON restaurants FOR ALL USING (true);
