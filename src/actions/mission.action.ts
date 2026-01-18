"use server";

import { auth } from "@clerk/nextjs/server";
import { app as workflow } from "@/graph/workflow";
import { revalidatePath } from "next/cache";

/**
 * runMission
 * The secure server-side bridge to trigger the LangGraph orchestrator.
 */
export async function runMission(query: string) {
    // 1. Security Check
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized: Commander identification required.");
    }

    console.log(`🚀 Mission Initiated by ${userId}: ${query}`);

    try {
        // 2. Invoke the Agents
        // This runs on the server, leveraging .env keys safely.
        const finalState = await workflow.invoke({
            userRequest: query,
            userId: userId,
            status: "starting"
        });

        // 3. Refresh the Dashboard Data
        // Forces Next.js to re-fetch the wallet balance and transaction history.
        revalidatePath("/");

        // 4. Return Success
        return {
            success: true,
            data: finalState.results || [],
            cost: finalState.budget || 0,
            status: finalState.status
        };

    } catch (error: any) {
        console.error("💥 Mission Failed:", error);
        return {
            success: false,
            error: error.message || "Mission aborted due to internal error."
        };
    }
}
