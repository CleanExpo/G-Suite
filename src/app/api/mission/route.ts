import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { app as workflow } from "@/graph/workflow";

/**
 * POST /api/mission
 * Triggers the LangGraph orchestrator for a new user request.
 */
export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { description } = await req.json();
        if (!description) {
            return NextResponse.json({ message: "Description is required" }, { status: 400 });
        }

        console.log(`🚀 API: Launching mission for ${userId}...`);

        // Invoke the LangGraph workflow
        const result = await workflow.invoke({
            userRequest: description,
            userId: userId,
            status: "starting"
        });

        if (result.error) {
            console.error(`❌ Mission Failed: ${result.error}`);
            return NextResponse.json({ message: result.error }, { status: 402 }); // 402 = Payment Required if billing failed
        }

        return NextResponse.json({
            success: true,
            results: result.results,
            status: result.status
        });

    } catch (error: any) {
        console.error("💥 API Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
