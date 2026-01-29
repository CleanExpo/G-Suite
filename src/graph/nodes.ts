import { ProjectStateType } from './state';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { billingGate } from '../billing/costGate';
import { createSlidesStoryboard } from '../tools/googleSlides';
import { runNotebookLMAgent } from '../agents/notebookLM';
import { generateImage, generateVideo, webIntel } from '../tools/mediaEngine';
import { searchConsoleAudit } from '../tools/searchConsole';
import { localSEOAnalyzer } from '../lib/geo/local-seo-analyzer';
import { getJinaClient } from '../lib/jina/client';
import { getDocumentProcessor } from '../lib/document-processor/engine';
import { z } from 'zod';

const SpecSchema = z.object({
  tool: z.enum([
    // Core tools
    'google_slides_storyboard',
    'notebook_lm_research',
    'image_generation',
    'video_generation',
    'web_intel',
    'search_console_audit',
    'shopify_sync',
    'social_blast',
    'web_mastery_audit',
    // Agent routing tools
    'agent:marketing-strategist',
    'agent:seo-analyst',
    'agent:social-commander',
    'agent:content-orchestrator',
    'agent:mission-overseer',
    'agent:genesis-architect',
    'agent:browser-agent',
    'agent:ui-auditor',
    'agent:web-scraper',
    'agent:data-collector',
    // Google API Enhanced Skills
    'deep_research',
    'veo_31_generate',
    'veo_31_upsample',
    'document_ai_extract',
    'gemini_3_flash',
    'geo_marketing_audit',
    'brand_dna_extraction',
    'deep_research_synthesis',
    // Web Intelligence Skills
    'web_unlocker',
    'serp_collector',
    'web_crawler',
    'structured_scraper',
    'data_archive',
    'deep_lookup',
  ]),
  payload: z.any(),
  reasoning: z.string().optional(), // Architect's "Chain of Thought"
});

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || '',
);
const model = genAI.getGenerativeModel({
  model: 'gemini-3-pro-preview',
  systemInstruction: `You are the G-Pilot Fleet Architect. Your core directive is "Mission Sovereignty". 
    You convert vague user desires into high-precision, executable JSON specs. 
    You outperform manual prompting by anticipating needs:
    - If they ask for a presentation, use "google_slides_storyboard" and ensure the content is rich and structured.
    - If they ask for research, use "web_intel" with search-grounding logic.
    - If they mention sales or products, use "shopify_sync".
    - If they mention posting or growth, use "social_blast".
    - If they mention local SEO, proximity, or "where do I rank locally?", use "geo_marketing_audit".
    - If they ask for brand analysis, style guides, or "who am I visually?", use "brand_dna_extraction".
    - If they provide documents, invoices, or contracts, use "document_ai_extract".
    - If they ask for deep, comprehensive research or market reports, use "deep_research_synthesis".
    - ALWAYS provide a 'reasoning' block explaining your architectural decisions.
    `,
});

/**
 * 1. The Architect Node
 * LLM analyzes request and outputs a JSON SPEC for the G-Pilot fleet.
 */
export async function architectNode(state: ProjectStateType) {
  console.log('🧠 G-Pilot Architect is thinking...');

  const prompt = `
    Mission Request: "${state.userRequest}"
    Target Locale: "${state.locale || 'en'}"
    
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
    - geo_marketing_audit: { businessName, address, phone }
    - brand_dna_extraction: { url }
    - document_ai_extract: { documentUrl }
    - deep_research_synthesis: { topic, focusAreas: [] }
    
    Return ONLY valid JSON following the SpecSchema.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response
      .text()
      .replace(/```json|```/gi, '')
      .trim();
    const json = JSON.parse(text);

    const spec = SpecSchema.parse(json);
    console.log('Planned MISSION SPEC:', JSON.stringify(spec, null, 2));
    return { spec, status: 'PLANNED' };
  } catch (error: any) {
    console.error('Architect error:', error);
    return { error: `Architect failed: ${error.message}`, status: 'REJECTED' };
  }
}

/**
 * 2. The Billing Node
 */
export async function billingNode(state: ProjectStateType) {
  console.log('💰 Calculating mission fuel...');
  if (!state.spec) return { status: 'REJECTED', error: 'No SPEC planned.' };

  let costKey: any = 'DEEP_RESEARCH';
  switch (state.spec.tool) {
    case 'google_slides_storyboard':
      costKey = 'SLIDE_DECK';
      break;
    case 'image_generation':
      costKey = 'IMAGE_GEN';
      break;
    case 'video_generation':
      costKey = 'VIDEO_GEN';
      break;
    case 'shopify_sync':
      costKey = 'DEEP_RESEARCH';
      break;
    case 'social_blast':
      costKey = 'DEEP_RESEARCH';
      break;
    default:
      costKey = 'DEEP_RESEARCH';
  }

  try {
    await billingGate(state.userId, costKey);
    return { status: 'APPROVED', budget: 500 };
  } catch (error: any) {
    return { status: 'REJECTED', error: error.message };
  }
}

/**
 * 3. The Executor Node
 */
export async function executorNode(state: ProjectStateType) {
  if (state.status === 'REJECTED' || !state.spec) return {};

  console.log(`🛠️ G-Pilot Fleet: Executing ${state.spec.tool}...`);
  const results: any[] = [];

  try {
    // Real implementations
    if (state.spec.tool === 'image_generation') {
      results.push(await generateImage(state.userId, state.spec.payload.prompt));
    } else if (state.spec.tool === 'video_generation') {
      results.push(await generateVideo(state.userId, state.spec.payload.prompt));
    } else if (state.spec.tool === 'web_intel') {
      results.push(await webIntel(state.userId, state.spec.payload.query));
    } else if (state.spec.tool === 'search_console_audit') {
      results.push(await searchConsoleAudit(state.userId, state.spec.payload.siteUrl));
    } else if (state.spec.tool === 'google_slides_storyboard') {
      results.push(await createSlidesStoryboard(state.userId, state.spec.payload));
    } else if (state.spec.tool === 'notebook_lm_research') {
      results.push(await runNotebookLMAgent(state.userId, state.spec.payload.filePath));
    }
    // High-Precision Real Tools
    else if (state.spec.tool === 'shopify_sync') {
      const { syncShopifyStore } = await import('../tools/shopifySync.js');
      results.push(await syncShopifyStore(state.userId));
    } else if (state.spec.tool === 'social_blast') {
      const { deploySocialBlast } = await import('../tools/socialSync.js');
      results.push(await deploySocialBlast(state.userId, state.spec.payload));
    } else if (state.spec.tool === 'web_mastery_audit') {
      const { performWebMasteryAudit } = await import('../tools/webMasteryAudit.js');
      results.push(await performWebMasteryAudit(state.spec.payload.url));
    }
    // Agent Routing - Unified through Mission Overseer
    else if (state.spec.tool.startsWith('agent:')) {
      const targetAgentName = state.spec.tool.replace('agent:', '');
      console.log(`🤖 Unified Routing: Delegating ${targetAgentName} to Mission Overseer`);

      const { AgentRegistry, initializeAgents } = await import('../agents');
      await initializeAgents();

      const overseer = AgentRegistry.get('mission-overseer');

      if (overseer) {
        // We wrap the specific agent call into a mission context for the Overseer
        // The Overseer's new logic will see 'explicitAgents' and skip heuristic analysis
        const context = {
          userId: state.userId,
          mission: state.userRequest,
          locale: state.locale,
          config: {
            ...state.spec.payload,
            explicitAgents: [targetAgentName] // <--- Force Overseer to use this agent
          }
        };

        // Execute the unified loop: Plan -> Execute (w/ Independent Verify) -> Result
        const plan = await overseer.plan(context);
        const result = await overseer.execute(plan, context);
        const verification = await overseer.verify(result, context);

        results.push({
          agent: 'mission-overseer',
          targetAgent: targetAgentName,
          unifiedResult: result,
          verification
        });

      } else {
        results.push({ error: 'Critical: Mission Overseer not found in registry.' });
      }
    }
    // Google API Enhanced Skills
    else if (state.spec.tool === 'deep_research') {
      const { deepResearch } = await import('../tools/googleAPISkills');
      results.push(await deepResearch(state.userId, state.spec.payload.topic, state.spec.payload.options));
    }
    else if (state.spec.tool === 'veo_31_generate') {
      const { veo31Generate } = await import('../tools/googleAPISkills');
      results.push(await veo31Generate(state.userId, state.spec.payload.prompt, state.spec.payload.options));
    }
    else if (state.spec.tool === 'veo_31_upsample') {
      const { veo31Upsample } = await import('../tools/googleAPISkills');
      results.push(await veo31Upsample(state.userId, state.spec.payload.videoUrl, state.spec.payload.resolution));
    }
    else if (state.spec.tool === 'document_ai_extract') {
      // For standalone tool call, we assume file is already uploaded or URL provided
      const { getDocumentProcessor } = await import('../lib/document-processor/engine');
      const processor = getDocumentProcessor();
      results.push(await processor.process({
        fileName: 'document.pdf',
        documentUrl: state.spec.payload.documentUrl
      } as any));
    }
    else if (state.spec.tool === 'gemini_3_flash') {
      const { gemini3Flash } = await import('../tools/googleAPISkills');
      results.push(await gemini3Flash(state.userId, state.spec.payload.prompt, state.spec.payload.options));
    }
    else if (state.spec.tool === 'geo_marketing_audit') {
      const { businessName, address, phone } = state.spec.payload;
      results.push(await localSEOAnalyzer.auditNAP(businessName, address, phone));
    }
    else if (state.spec.tool === 'brand_dna_extraction') {
      const jina = getJinaClient();
      const { url } = state.spec.payload;
      const { content } = await jina.read(url);
      const { BrandExtractor } = await import('../lib/brand/extractor');
      const extractor = new BrandExtractor();
      results.push(await extractor.extract(content, url));
    }
    else if (state.spec.tool === 'deep_research_synthesis') {
      const { deepResearch } = await import('../tools/googleAPISkills');
      results.push(await deepResearch(state.userId, state.spec.payload.topic, { depth: 'deep', focusAreas: state.spec.payload.focusAreas }));
    }
    // Web Intelligence Skills
    else if (state.spec.tool === 'web_unlocker') {
      const { web_unlocker } = await import('../tools/webIntelligenceSkills');
      results.push(await web_unlocker(state.userId, state.spec.payload.url, state.spec.payload.options));
    }
    else if (state.spec.tool === 'serp_collector') {
      const { serp_collector } = await import('../tools/webIntelligenceSkills');
      results.push(await serp_collector(state.userId, state.spec.payload.query, state.spec.payload.options));
    }
    else if (state.spec.tool === 'web_crawler') {
      const { web_crawler } = await import('../tools/webIntelligenceSkills');
      results.push(await web_crawler(state.userId, state.spec.payload.startUrl, state.spec.payload.options));
    }
    else if (state.spec.tool === 'structured_scraper') {
      const { structured_scraper } = await import('../tools/webIntelligenceSkills');
      results.push(await structured_scraper(state.userId, state.spec.payload.domain, state.spec.payload.options));
    }
    else if (state.spec.tool === 'data_archive') {
      const { data_archive } = await import('../tools/webIntelligenceSkills');
      results.push(await data_archive(state.userId, state.spec.payload.data, state.spec.payload.options));
    }
    else if (state.spec.tool === 'deep_lookup') {
      const { deep_lookup } = await import('../tools/webIntelligenceSkills');
      results.push(await deep_lookup(state.userId, state.spec.payload.entityId, state.spec.payload.options));
    }

    return { results, status: 'COMPLETED' };
  } catch (error: any) {
    return { error: error.message, status: 'REJECTED' };
  }
}
