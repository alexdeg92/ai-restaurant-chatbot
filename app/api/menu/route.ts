import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const restaurantSlug = searchParams.get('restaurant') || 'chez-marcel';

  const { data: restaurant } = await supabaseAdmin
    .from('restaurants')
    .select('id')
    .eq('slug', restaurantSlug)
    .single();

  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('category')
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { restaurant_id, category, name, description, price, available = true } = body;

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .insert({ restaurant_id, category, name, description, price, available })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

  const { error } = await supabaseAdmin.from('menu_items').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
