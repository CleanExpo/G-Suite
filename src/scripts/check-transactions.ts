import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = 'user_boss_123';

  console.log(`📊 Querying Audit Trail for ${userId}...`);

  const wallet = await prisma.userWallet.findUnique({
    where: { clerkId: userId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!wallet) {
    console.error('❌ No wallet found.');
    return;
  }

  console.log(`\n💰 Current Balance: ${wallet.balance} credits`);
  console.log('\n📜 Transaction History:');
  console.log('------------------------------------------');

  wallet.transactions.forEach((tx: any) => {
    const symbol = tx.amount > 0 ? '➕' : '➖';
    console.log(
      `${tx.createdAt.toISOString()} | ${symbol} ${Math.abs(tx.amount).toString().padEnd(6)} | ${tx.description}`,
    );
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
