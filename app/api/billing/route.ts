import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'sk_test_placeholder') {
    return null;
  }
  return new Stripe(key, {
    apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
  });
}

const PLANS = {
  starter: {
    name: 'Essentiel',
    monthlyPrice: 9900, // $99 in cents
    setupPrice: 50000,  // $500
  },
  pro: {
    name: 'Professionnel',
    monthlyPrice: 19900, // $199
    setupPrice: 120000,  // $1200
  },
  enterprise: {
    name: 'Entreprise',
    monthlyPrice: 29900, // $299
    setupPrice: 200000,  // $2000
  },
};

export async function POST(req: NextRequest) {
  try {
    const { plan, restaurantSlug, email } = await req.json();

    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }

    const planInfo = PLANS[plan as keyof typeof PLANS];
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe non configuré. Contactez-nous pour activer la facturation.' }, { status: 503 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: { name: `RestoBot AI - ${planInfo.name} (mensuel)` },
            unit_amount: planInfo.monthlyPrice,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'cad',
            product_data: { name: `RestoBot AI - Frais d'installation ${planInfo.name}` },
            unit_amount: planInfo.setupPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      metadata: { plan, restaurantSlug: restaurantSlug || '' },
      success_url: `${origin}/dashboard?billing=success`,
      cancel_url: `${origin}/#tarifs`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Billing error:', error);
    const errMsg = error instanceof Error ? error.message : 'Erreur de paiement';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ plans: PLANS });
}
