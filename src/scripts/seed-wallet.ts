import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Use arg or env or default
  const userId = process.argv[2] || process.env.CLERK_USER_ID || "user_boss_123";
  const initialCredits = 5000;    // $50.00

  console.log(`🌱 Seeding Wallet for ${userId}...`);

  const wallet = await prisma.userWallet.upsert({
    where: { clerkId: userId },
    update: { balance: initialCredits }, // If exists, reset to 5000
    create: {
      clerkId: userId,
      balance: initialCredits,
    },
  });

  // Log the "Deposit" for audit trail
  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      amount: initialCredits,
      description: "ADMIN: Initial Dev Mode Top-up",
      metadata: { source: "seed-script" }
    }
  });

  console.log(`✅ Wallet Funded! New Balance: ${wallet.balance} credits.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
