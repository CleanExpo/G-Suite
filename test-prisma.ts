import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Attempting to connect to database...");
    const start = Date.now();
    try {
        const wallets = await prisma.userWallet.findMany({
            where: { clerkId: '117479707575667676829' }
        });
        console.log(`✅ Connection successful! Took ${Date.now() - start}ms`);
        console.log("Result:", wallets);
    } catch (error: any) {
        console.error("❌ Connection failed:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
