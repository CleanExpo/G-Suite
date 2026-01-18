import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_mock_key_for_build";

export const stripe = new Stripe(stripeKey, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
});
