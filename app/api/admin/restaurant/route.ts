import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug') || 'chez-marcel';

  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ restaurant: data });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { slug, ...updates } = body;

  if (!slug) return NextResponse.json({ error: 'Slug requis' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .update(updates)
    .eq('slug', slug)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ restaurant: data });
}
