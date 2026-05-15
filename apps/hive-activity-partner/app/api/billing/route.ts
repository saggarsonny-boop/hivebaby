import { NextResponse } from 'next/server';

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

    // In production, this would initialize a Stripe Checkout Session for the Base Platform Fee
    // and set up a usage-based / metered billing subscription for the active seat count.

    return NextResponse.json({ 
      success: true, 
      enterpriseId,
      seatCount,
      seatPricePerMonth,
      basePlatformFee,
      totalAnnualContractValue,
      checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_test_mock_enterprise_aac'
    });
  } catch (error) {
    console.error('AAC Billing setup failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
