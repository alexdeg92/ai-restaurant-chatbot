import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const restaurantSlug = searchParams.get('restaurant') || 'chez-marcel';
  const limit = parseInt(searchParams.get('limit') || '50');

  const { data: restaurant } = await supabaseAdmin
    .from('restaurants')
    .select('id')
    .eq('slug', restaurantSlug)
    .single();

  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversations: data });
}
