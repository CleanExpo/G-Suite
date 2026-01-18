"use server"

import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

const PACKAGES = {
    STARTER: { amount: 2200, name: "Pilot Credits 500", credits: 500, productId: "prod_ToLSafje1tgh3c" },
    PRO: { amount: 3300, name: "Pilot Credits 1500", credits: 1500, productId: "prod_ToLUBhCExvYtCl" },
    GROWTH: { amount: 4995, name: "Pilot Credits 5000", credits: 5000, productId: "prod_ToLWuV1x720yCE" },
    ENTERPRISE: { amount: 9900, name: "Pilot Credits 15,000", credits: 15000, productId: "prod_ToLXyUQmlGqFcc" },
};

export async function createCheckoutSession(packageKey: keyof typeof PACKAGES) {
    const { userId } = await auth();
    const headerList = await headers();
    const origin = headerList.get("origin");

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const pkg = PACKAGES[packageKey];

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product: pkg.productId,
                    unit_amount: pkg.amount,
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `${origin}/?success=true`,
        cancel_url: `${origin}/?canceled=true`,
        metadata: {
            userId: userId,
            credits: pkg.credits.toString(),
        },
    });

    return { url: session.url };
}
