const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')) {
  console.error('ERROR: need sk_live_ key. Run: export STRIPE_SECRET_KEY=sk_live_...');
  process.exit(1);
}
console.log('✓ Live key confirmed. Creating 3 support products...\n');

async function run() {
  // 1. UD Support Monthly — $1.99/month
  const p1 = await stripe.products.create({ name: 'UD Support Monthly', description: 'Universal Document™ priority support — monthly' });
  const price1 = await stripe.prices.create({ product: p1.id, unit_amount: 199, currency: 'usd', recurring: { interval: 'month' } });
  const link1 = await stripe.paymentLinks.create({ line_items: [{ price: price1.id, quantity: 1 }] });
  console.log(`✓ UD Support Monthly\n  price: ${price1.id}\n  link:  https://buy.stripe.com/${link1.id}`);

  // 2. UD Support Annual — $19.00/year
  const p2 = await stripe.products.create({ name: 'UD Support Annual', description: 'Universal Document™ priority support — annual' });
  const price2 = await stripe.prices.create({ product: p2.id, unit_amount: 1900, currency: 'usd', recurring: { interval: 'year' } });
  const link2 = await stripe.paymentLinks.create({ line_items: [{ price: price2.id, quantity: 1 }] });
  console.log(`✓ UD Support Annual\n  price: ${price2.id}\n  link:  https://buy.stripe.com/${link2.id}`);

  // 3. UD Support One-Time — $5.00 (no recurring)
  const p3 = await stripe.products.create({ name: 'UD Support One-Time', description: 'Universal Document™ priority support — one-time' });
  const price3 = await stripe.prices.create({ product: p3.id, unit_amount: 500, currency: 'usd' });
  const link3 = await stripe.paymentLinks.create({ line_items: [{ price: price3.id, quantity: 1 }] });
  console.log(`✓ UD Support One-Time\n  price: ${price3.id}\n  link:  https://buy.stripe.com/${link3.id}`);

  console.log('\n--- OUTPUT ---');
  console.log(JSON.stringify({
    ud_support_monthly: { priceId: price1.id, paymentLink: `https://buy.stripe.com/${link1.id}` },
    ud_support_annual:  { priceId: price2.id, paymentLink: `https://buy.stripe.com/${link2.id}` },
    ud_support_onetime: { priceId: price3.id, paymentLink: `https://buy.stripe.com/${link3.id}` },
  }, null, 2));
}

run().catch(console.error);
