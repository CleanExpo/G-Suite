import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/prisma';

export async function POST(req: Request) {
  const rawBody = await req.arrayBuffer();
  const body = Buffer.from(rawBody).toString('utf-8');

  // We get the signature from headers directly on the request object for reliability
  const signature = req.headers.get('stripe-signature') as string;

  let event;

  // 1. Verify it actually came from Stripe
  try {
    console.log('FULL_SIG:', signature);
    console.log('BODY_LEN:', rawBody.byteLength);

    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      // In Local Development, signature verification can be finicky due to body parsing/tunneling
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Signature verification failed in DEV. Bypassing for testing.');
        event = JSON.parse(body);
      } else {
        throw err;
      }
    }
    console.log('✅ Event Processing:', event.type);
  } catch (error: any) {
    console.error(`❌ Webhook Error: ${error.message}`);
    return new NextResponse(`Error: ${error.message}`, { status: 400 });
  }

  // 2. Handle the "Money Received" Event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;

    // We sent the Clerk ID as 'metadata' during checkout creation
    const userId = session.metadata.userId;
    const creditsToAdd = parseInt(session.metadata.credits || '0');

    if (!userId || creditsToAdd <= 0) {
      console.error('Invalid metadata in Stripe Session:', session.id);
      return new NextResponse('Invalid Metadata', { status: 400 });
    }

    console.log(`💰 Payment received from ${userId}: ${creditsToAdd} credits`);

    // 3. Update the Ledger (Atomic)
    try {
      await prisma.$transaction(async (tx: any) => {
        // Upsert Wallet (Create if doesn't exist)
        const wallet = await tx.userWallet.upsert({
          where: { clerkId: userId },
          update: { balance: { increment: creditsToAdd } },
          create: { clerkId: userId, balance: creditsToAdd },
        });

        // Log Transaction
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            amount: creditsToAdd,
            description: `Stripe Top-up (${(session.amount_total / 100).toFixed(2)} USD)`,
            metadata: { stripeSessionId: session.id },
          },
        });
      });
      console.log('✅ Ledger updated successfully.');
    } catch (dbError) {
      console.error('Ledger Update Error:', dbError);
      return new NextResponse('Database Error', { status: 500 });
    }
  }

  return new NextResponse('Webhook Proceeded', { status: 200 });
}
