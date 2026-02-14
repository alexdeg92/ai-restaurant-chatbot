import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const restaurantSlug = searchParams.get('restaurant') || 'chez-marcel';
  const date = searchParams.get('date');
  const status = searchParams.get('status');

  const { data: restaurant } = await supabaseAdmin
    .from('restaurants')
    .select('id')
    .eq('slug', restaurantSlug)
    .single();

  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });
  }

  let query = supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (date) query = query.eq('date', date);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reservations: data });
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  
  if (!id || !status) {
    return NextResponse.json({ error: 'ID et status requis' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('reservations')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reservation: data });
}
