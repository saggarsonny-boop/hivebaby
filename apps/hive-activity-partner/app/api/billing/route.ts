import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
}) : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { enterpriseId, seatCount } = body;

    if (!enterpriseId || !seatCount) {
      return NextResponse.json({ error: 'Missing enterpriseId or seatCount' }, { status: 400 });
    }

    // BASE PLATFORM FEE
    const basePlatformFee = 150000; // $150,000 / year

    // VOLUME DISCOUNT LOGIC FOR SEATS
    let seatPricePerMonth = 12; // $12 default
    if (seatCount >= 1000) seatPricePerMonth = 10;
    if (seatCount >= 10000) seatPricePerMonth = 8;
    if (seatCount >= 100000) seatPricePerMonth = 5;

    const annualSeatRevenue = seatCount * seatPricePerMonth * 12;
    const totalAnnualContractValue = basePlatformFee + annualSeatRevenue;

    console.log(`[AAC Billing] Calculated enterprise contract for ${enterpriseId}. Seats: ${seatCount}. ACV: $${totalAnnualContractValue}`);

    let checkoutUrl = 'https://checkout.stripe.com/c/pay/cs_test_mock_enterprise_aac';

    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'us_bank_account'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Hive AAC Base Enterprise Platform (Annual)',
                description: 'Core infrastructure and vector sandbox deployment.',
              },
              unit_amount: basePlatformFee * 100, // Stripe expects cents
            },
            quantity: 1,
          },
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `AAC Seat Licenses (${seatCount} users)`,
                description: `Annualized rate of $${seatPricePerMonth}/user/month`,
              },
              unit_amount: annualSeatRevenue * 100, // Stripe expects cents
            },
            quantity: 1,
          }
        ],
        mode: 'payment',
        success_url: `${req.headers.get('origin') || 'http://localhost:3000'}/?success=true`,
        cancel_url: `${req.headers.get('origin') || 'http://localhost:3000'}/?canceled=true`,
      });
      checkoutUrl = session.url || checkoutUrl;
    }

    return NextResponse.json({ 
      success: true, 
      enterpriseId,
      seatCount,
      seatPricePerMonth,
      basePlatformFee,
      totalAnnualContractValue,
      checkoutUrl
    });
  } catch (error) {
    console.error('AAC Billing setup failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
