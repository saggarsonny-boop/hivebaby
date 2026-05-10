import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
// In a real app you'd import Stripe from 'stripe'
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
//   apiVersion: "2024-04-10",
// });

export async function POST(req: Request) {
  const body = await req.text();
  // const signature = headers().get("Stripe-Signature") as string;
  
  // let event: Stripe.Event;

  try {
    // event = stripe.webhooks.constructEvent(
    //   body,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET as string
    // );
    
    // MOCK PARSING FOR NOW SINCE NO STRIPE INSTALLED IN HIVE-CONFESSION
    const event = JSON.parse(body);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const clerkUserId = session.client_reference_id;

      if (clerkUserId) {
        // Upgrade user to Pro
        await (await clerkClient()).users.updateUserMetadata(clerkUserId, {
          publicMetadata: {
            tier: "pro"
          }
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
        const session = event.data.object;
        const clerkUserId = session.client_reference_id; // Usually you'd fetch from customer metadata
        if (clerkUserId) {
          // Downgrade user to free
          await (await clerkClient()).users.updateUserMetadata(clerkUserId, {
            publicMetadata: {
              tier: "free"
            }
          });
        }
    }

    return NextResponse.json({ result: event, ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Webhook error", ok: false },
      { status: 400 }
    );
  }
}
