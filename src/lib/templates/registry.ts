import { AgentTemplate } from './types';

export const PREBUILT_TEMPLATES: AgentTemplate[] = [
  {
    id: 'tpl_campaign_manager',
    name: 'Campaign Strategist Pro',
    description: 'Omnichannel campaign planning with market grounding and asset coordination.',
    category: 'marketing',
    icon: 'Zap',
    tools: ['web_intel', 'gemini_3_flash', 'veo_31_generate', 'social_blast'],
    systemPrompt:
      'You are an elite Marketing Strategist. Plan comprehensive campaigns using grounded market research and coordinated asset generation.',
    parameters: [
      { name: 'targetAudience', type: 'string', description: 'Who are we targeting?' },
      {
        name: 'budgetLevel',
        type: 'selection',
        description: 'Budget aggressiveness',
        options: ['Conservative', 'Moderate', 'Aggressive'],
      },
    ],
    v81Refined: true,
    author: 'G-Pilot Core',
  },
  {
    id: 'tpl_seo_hawk',
    name: 'SEO Hawk-Eye',
    description: 'Deep technical SEO auditing and local ranking optimization.',
    category: 'marketing',
    icon: 'Search',
    tools: ['web_mastery_audit', 'geo_marketing_audit', 'serp_collector'],
    systemPrompt:
      'You are an SEO Specialist focused on technical excellence and local visibility. Audit websites and optimize for search engine dominance.',
    parameters: [
      { name: 'domainUrl', type: 'string', description: 'URL to audit' },
      { name: 'targetKeywords', type: 'string', description: 'Primary keywords' },
    ],
    v81Refined: true,
    author: 'G-Pilot Core',
  },
  {
    id: 'tpl_video_alchemist',
    name: 'Video Alchemist',
    description: 'Generative video creation for high-impact social media reels and ads.',
    category: 'creative',
    icon: 'Video',
    tools: ['veo_31_generate', 'veo_31_upsample', 'brand_dna_extraction'],
    systemPrompt:
      'You are a Creative Director specialized in generative video. Transform brand DNA into cinematic video assets.',
    parameters: [
      { name: 'styleOverride', type: 'string', description: 'Specific visual style (optional)' },
    ],
    v81Refined: true,
    author: 'G-Pilot Core',
  },
  {
    id: 'tpl_intel_gatherer',
    name: 'Market Intel Gatherer',
    description: 'Autonomous deep research on competitors, trends, and breakthroughs.',
    category: 'research',
    icon: 'BookOpen',
    tools: ['deep_research_synthesis', 'web_unlocker', 'brand_dna_extraction'],
    systemPrompt:
      'You are a Market Intelligence Agent. Perform deep research and synthesize mission-critical insights.',
    parameters: [
      {
        name: 'researchDepth',
        type: 'selection',
        description: 'Depth of analysis',
        options: ['shallow', 'moderate', 'deep'],
      },
    ],
    v81Refined: true,
    author: 'G-Pilot Core',
  },
];

export function getTemplate(id: string): AgentTemplate | undefined {
  return PREBUILT_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): AgentTemplate[] {
  return PREBUILT_TEMPLATES.filter((t) => t.category === category);
}
