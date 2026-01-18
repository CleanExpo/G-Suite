import { ProjectStateType } from "./state";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { billingGate } from "../middleware/costGate";
import { createSlidesStoryboard } from "../tools/googleSlides";
import { runNotebookLMAgent } from "../agents/notebookLM";
import { z } from "zod";

const SpecSchema = z.object({
    tool: z.enum(["google_slides_storyboard", "notebook_lm_research"]),
    payload: z.any()
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

/**
 * 1. The Architect Node
 * LLM analyzes request and outputs a JSON SPEC.
 */
export async function architectNode(state: ProjectStateType) {
    console.log("🧠 Architect is thinking...");

    const prompt = `
    You are the Architect for SuitePilot. Convert the following user request into a JSON SPEC.
    User Request: "${state.userRequest}"
    
    The SPEC must have:
    - tool: "google_slides_storyboard" or "notebook_lm_research"
    - payload: Relevant data for the tool.
      - For google_slides_storyboard: { title, slides: [{ title, content }] }
      - For notebook_lm_research: { filePath }
    
    Return ONLY valid JSON.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/gi, "").trim();
        const json = JSON.parse(text);

        // Validate with Zod
        const spec = SpecSchema.parse(json);

        console.log("Planned SPEC:", JSON.stringify(spec, null, 2));
        return {
            spec,
            status: "PLANNED",
        };
    } catch (error: any) {
        console.error("Architect error:", error);
        return {
            error: `Architect failed: ${error.message}`,
            status: "REJECTED",
        };
    }
}

/**
 * 2. The Billing Node (The Gatekeeper)
 * Calculates costs and checks wallet balance atomically.
 */
export async function billingNode(state: ProjectStateType) {
    console.log("💰 Calculating costs...");

    if (!state.spec) return { status: "REJECTED", error: "No SPEC planned." };

    // Simple logic: 1 slide = 50 credits, base fee for others
    let estimatedCost = 50;
    if (state.spec.tool === "google_slides_storyboard") {
        estimatedCost = (state.spec.payload.slides?.length || 1) * 50;
    } else if (state.spec.tool === "notebook_lm_research") {
        estimatedCost = 500;
    }

    try {
        // Deducting credits via billingGate
        // We Use SLIDE_DECK as it's the more expensive base, or adjust as needed
        const costKey = state.spec.tool === "google_slides_storyboard" ? "SLIDE_DECK" : "DEEP_RESEARCH";
        await billingGate(state.userId, costKey);
        console.log(`✅ Payment Approved. Budgeted ${estimatedCost} credits.`);

        return {
            status: "APPROVED",
            budget: estimatedCost
        };
    } catch (error: any) {
        console.log("🛑 Payment Failed:", error.message);
        return {
            status: "REJECTED",
            error: error.message
        };
    }
}

/**
 * 3. The Executor Node (The Worker)
 * Executes the tools defined in the SPEC.
 */
export async function executorNode(state: ProjectStateType) {
    if (state.status === "REJECTED") return {};

    console.log("🛠️ Executing tasks...");
    const results = [];

    try {
        // If SPEC says "google_slides_storyboard", call the tool
        if (state.spec.tool === "google_slides_storyboard") {
            const output = await createSlidesStoryboard(state.userId, state.spec.payload);
            results.push(output);
        }
        // If SPEC says "notebook_lm_research", call the agent
        else if (state.spec.tool === "notebook_lm_research") {
            const output = await runNotebookLMAgent(state.userId, state.spec.payload.filePath);
            results.push(output);
        }

        return {
            results,
            status: "COMPLETED"
        };
    } catch (error: any) {
        console.error("❌ Execution Failed:", error.message);
        return {
            error: error.message,
            status: "REJECTED"
        };
    }
}
