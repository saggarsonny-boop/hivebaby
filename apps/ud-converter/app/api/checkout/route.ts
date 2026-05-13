import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_PLUS_MONTHLY, // Set in Vercel ENV
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://converter.universaldocument.org"}/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://converter.universaldocument.org"}/?canceled=true`,
      metadata: {
        clerkUserId: userId, // We pass Clerk ID to update entitlements later
      },
    });

    if (!session.url) {
      throw new Error("Failed to create Stripe session URL");
    }

    return NextResponse.redirect(session.url);
  } catch (error) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
