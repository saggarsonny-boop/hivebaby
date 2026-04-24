const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('ERROR: STRIPE_SECRET_KEY not set. Run: export STRIPE_SECRET_KEY=sk_live_...');
  process.exit(1);
}
if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
  console.error('ERROR: Key does not start with sk_live_ — not a live key. Refusing.');
  process.exit(1);
}
console.log('✓ Live key confirmed. Creating 22 products...\n');

const products = [
  { name: 'UD Solo',                   amount: 900,     interval: 'month' },
  { name: 'UD Pro',                    amount: 2900,    interval: 'month' },
  { name: 'UD Premium',                amount: 4900,    interval: 'month' },
  { name: 'Enterprise Starter',        amount: 19900,   interval: 'month' },
  { name: 'Enterprise Pro',            amount: 49900,   interval: 'month' },
  { name: 'Enterprise Scale',          amount: 99900,   interval: 'month' },
  { name: 'cSDK Lite',                 amount: 49900,   interval: 'month' },
  { name: 'cSDK Pro',                  amount: 99900,   interval: 'month' },
  { name: 'cSDK Scale',                amount: 299900,  interval: 'month' },
  { name: 'UD Signer Solo',            amount: 1200,    interval: 'month' },
  { name: 'UD Signer Business',        amount: 2900,    interval: 'month' },
  { name: 'UD Solo Annual',            amount: 9000,    interval: 'year' },
  { name: 'UD Pro Annual',             amount: 24900,   interval: 'year' },
  { name: 'UD Premium Annual',         amount: 39900,   interval: 'year' },
  { name: 'Enterprise Starter Annual', amount: 199000,  interval: 'year' },
  { name: 'Enterprise Pro Annual',     amount: 499000,  interval: 'year' },
  { name: 'Enterprise Scale Annual',   amount: 999000,  interval: 'year' },
  { name: 'cSDK Lite Annual',          amount: 499000,  interval: 'year' },
  { name: 'cSDK Pro Annual',           amount: 999000,  interval: 'year' },
  { name: 'cSDK Scale Annual',         amount: 2999000, interval: 'year' },
  { name: 'UD Signer Solo Annual',     amount: 9900,    interval: 'year' },
  { name: 'UD Signer Business Annual', amount: 24900,   interval: 'year' },
];

async function createProducts() {
  const priceIds = {};
  const paymentLinks = {};

  for (const p of products) {
    try {
      const product = await stripe.products.create({
        name: p.name,
        description: `Universal Document™ ${p.name} subscription`,
      });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: p.amount,
        currency: 'usd',
        recurring: { interval: p.interval },
      });
      const link = await stripe.paymentLinks.create({
        line_items: [{ price: price.id, quantity: 1 }],
      });
      const key = p.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      priceIds[key] = price.id;
      paymentLinks[key] = `https://buy.stripe.com/${link.id}`;
      console.log(`✓ ${p.name}`);
      console.log(`  price:   ${price.id}`);
      console.log(`  link:    https://buy.stripe.com/${link.id}`);
    } catch (err) {
      console.error(`✗ ${p.name}: ${err.message}`);
    }
  }

  fs.writeFileSync('stripe-price-ids.json', JSON.stringify(priceIds, null, 2));
  fs.writeFileSync('stripe-payment-links.json', JSON.stringify(paymentLinks, null, 2));
  console.log('\n--- PRICE IDS ---');
  console.log(JSON.stringify(priceIds, null, 2));
  console.log('\n--- PAYMENT LINKS ---');
  console.log(JSON.stringify(paymentLinks, null, 2));
  console.log('\nDone. Files saved: stripe-price-ids.json, stripe-payment-links.json');
}

createProducts().catch(console.error);
