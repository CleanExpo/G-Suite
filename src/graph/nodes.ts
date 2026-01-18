import { ProjectStateType } from "./state";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { billingGate } from "../middleware/costGate";
import { createSlidesStoryboard } from "../tools/googleSlides";
import { runNotebookLMAgent } from "../agents/notebookLM";
import { generateImage, generateVideo, webIntel } from "../tools/mediaEngine";
import { searchConsoleAudit } from "../tools/searchConsole";
import { z } from "zod";

const SpecSchema = z.object({
    tool: z.enum([
        "google_slides_storyboard",
        "notebook_lm_research",
        "image_generation",
        "video_generation",
        "web_intel",
        "search_console_audit",
        "shopify_sync",
        "social_blast",
        "web_mastery_audit"
    ]),
    payload: z.any(),
    reasoning: z.string().optional() // Architect's "Chain of Thought"
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: `You are the G-Pilot Fleet Architect. Your core directive is "Mission Sovereignty". 
    You convert vague user desires into high-precision, executable JSON specs. 
    You outperform manual prompting by anticipating needs:
    - If they ask for a presentation, use "google_slides_storyboard" and ensure the content is rich and structured.
    - If they ask for research, use "web_intel" with search-grounding logic.
    - If they mention sales or products, use "shopify_sync".
    - If they mention posting or growth, use "social_blast".
    - If they mention SEO, performance, or "how do I look?", use "web_mastery_audit".
    - ALWAYS provide a 'reasoning' block explaining your architectural decisions.
    `
});

/**
 * 1. The Architect Node
 * LLM analyzes request and outputs a JSON SPEC for the G-Pilot fleet.
 */
export async function architectNode(state: ProjectStateType) {
    console.log("🧠 G-Pilot Architect is thinking...");

    const prompt = `
    Mission Request: "${state.userRequest}"
    
    Convert this into a MISSION SPEC.
    Tools Available:
    - google_slides_storyboard: { title, slides: [{ title, content }] }
    - notebook_lm_research: { filePath }
    - image_generation: { prompt }
    - video_generation: { prompt }
    - web_intel: { query }
    - search_console_audit: { siteUrl }
    - shopify_sync: { action: "sync_products" | "audit_sales" }
    - social_blast: { platform: "x" | "linkedin" | "reddit", content }
    - web_mastery_audit: { url }
    
    Return ONLY valid JSON following the SpecSchema.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/gi, "").trim();
        const json = JSON.parse(text);

        const spec = SpecSchema.parse(json);
        console.log("Planned MISSION SPEC:", JSON.stringify(spec, null, 2));
        return { spec, status: "PLANNED" };
    } catch (error: any) {
        console.error("Architect error:", error);
        return { error: `Architect failed: ${error.message}`, status: "REJECTED" };
    }
}

/**
 * 2. The Billing Node
 */
export async function billingNode(state: ProjectStateType) {
    console.log("💰 Calculating mission fuel...");
    if (!state.spec) return { status: "REJECTED", error: "No SPEC planned." };

    let costKey: any = "DEEP_RESEARCH";
    switch (state.spec.tool) {
        case "google_slides_storyboard": costKey = "SLIDE_DECK"; break;
        case "image_generation": costKey = "IMAGE_GEN"; break;
        case "video_generation": costKey = "VIDEO_GEN"; break;
        case "shopify_sync": costKey = "DEEP_RESEARCH"; break;
        case "social_blast": costKey = "DEEP_RESEARCH"; break;
        default: costKey = "DEEP_RESEARCH";
    }

    try {
        await billingGate(state.userId, costKey);
        return { status: "APPROVED", budget: 500 };
    } catch (error: any) {
        return { status: "REJECTED", error: error.message };
    }
}

/**
 * 3. The Executor Node
 */
export async function executorNode(state: ProjectStateType) {
    if (state.status === "REJECTED" || !state.spec) return {};

    console.log(`🛠️ G-Pilot Fleet: Executing ${state.spec.tool}...`);
    const results = [];

    try {
        // Real implementations
        if (state.spec.tool === "image_generation") {
            results.push(await generateImage(state.userId, state.spec.payload.prompt));
        } else if (state.spec.tool === "video_generation") {
            results.push(await generateVideo(state.userId, state.spec.payload.prompt));
        } else if (state.spec.tool === "web_intel") {
            results.push(await webIntel(state.userId, state.spec.payload.query));
        } else if (state.spec.tool === "search_console_audit") {
            results.push(await searchConsoleAudit(state.userId, state.spec.payload.siteUrl));
        } else if (state.spec.tool === "google_slides_storyboard") {
            results.push(await createSlidesStoryboard(state.userId, state.spec.payload));
        } else if (state.spec.tool === "notebook_lm_research") {
            results.push(await runNotebookLMAgent(state.userId, state.spec.payload.filePath));
        }
        // High-Precision Real Tools
        else if (state.spec.tool === "shopify_sync") {
            const { syncShopifyStore } = await import("../tools/shopifySync.js");
            results.push(await syncShopifyStore(state.userId));
        } else if (state.spec.tool === "social_blast") {
            const { deploySocialBlast } = await import("../tools/socialSync.js");
            results.push(await deploySocialBlast(state.userId, state.spec.payload));
        } else if (state.spec.tool === "web_mastery_audit") {
            const { performWebMasteryAudit } = await import("../tools/webMasteryAudit.js");
            results.push(await performWebMasteryAudit(state.spec.payload.url));
        }

        return { results, status: "COMPLETED" };
    } catch (error: any) {
        return { error: error.message, status: "REJECTED" };
    }
}
