import { AgentResult, VerificationReport } from '@/agents/base';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || '',
);

export interface MissionReport {
  missionId: string;
  timestamp: string;
  summary: string;
  artifacts: {
    name: string;
    type: string;
    preview?: string;
    url?: string;
  }[];
  verification: {
    passed: boolean;
    score: number;
    details: string[];
  };
  insights: string[];
  nextSteps: string[];
}

/**
 * Mission Report Generator
 *
 * Synthesizes agent results and verification reports into a cinematic mission dossier.
 */
export class ReportGeneratorClass {
  private readonly model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction:
      'You are the G-Pilot Intelligence Officer. Your job is to create elite, high-level mission dossiers for founders.',
  });

  async generate(
    mission: string,
    result: AgentResult,
    verification: VerificationReport,
  ): Promise<MissionReport> {
    const prompt = `
            Create a cinematic mission dossier for: "${mission}"
            
            Results: ${JSON.stringify(result.data)}
            Artifacts: ${JSON.stringify(result.artifacts?.map((a) => ({ name: a.name, type: a.type })))}
            Verification: ${JSON.stringify(verification.checks)}
            
            Return JSON matching:
            {
                "summary": "Executive summary of what was achieved",
                "insights": ["3-5 deep strategic insights discovered during execution"],
                "nextSteps": ["3 immediate action items for the founder"],
                "score": 0-100 quality score
            }
        `;

    try {
      const llmResult = await this.model.generateContent(prompt);
      const response = JSON.parse(
        llmResult.response
          .text()
          .replace(/```json|```/gi, '')
          .trim(),
      );

      return {
        missionId: Math.random().toString(36).substring(7).toUpperCase(),
        timestamp: new Date().toISOString(),
        summary: response.summary,
        artifacts:
          result.artifacts?.map((a) => ({
            name: a.name,
            type: a.type,
            url: typeof a.value === 'string' ? a.value : undefined,
          })) || [],
        verification: {
          passed: verification.passed,
          score: response.score,
          details: verification.checks.map((c) => `${c.name}: ${c.message}`),
        },
        insights: response.insights,
        nextSteps: response.nextSteps,
      };
    } catch (error) {
      console.error('Report generation failed', error);
      // Fallback
      return {
        missionId: 'ERROR',
        timestamp: new Date().toISOString(),
        summary: 'Manual report required due to generation failure.',
        artifacts: [],
        verification: { passed: false, score: 0, details: [] },
        insights: [],
        nextSteps: [],
      };
    }
  }
}

export const ReportGenerator = new ReportGeneratorClass();
