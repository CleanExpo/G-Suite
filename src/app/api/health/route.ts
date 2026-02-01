/**
 * Health Check API
 *
 * System health monitoring endpoint for G-Pilot platform.
 */

import { NextResponse } from 'next/server';
import { AgentRegistry, initializeAgents } from '@/agents/registry';
import { vertexHealthCheck } from '@/tools/vertexAI';

export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  components: {
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    latencyMs?: number;
    message?: string;
  }[];
  agents: {
    total: number;
    ready: number;
    names: string[];
  };
  googleProducts: {
    name: string;
    status: 'connected' | 'degraded' | 'disconnected';
  }[];
}

const startTime = Date.now();

export async function GET(): Promise<Response> {
  const healthStart = Date.now();

  try {
    // Initialize agents
    await initializeAgents();
    const agentNames = AgentRegistry.getAvailableAgents();

    // Check Vertex AI / Google connectivity
    const vertexHealth = await vertexHealthCheck();

    // Build component status
    const components = [
      {
        name: 'Next.js Runtime',
        status: 'healthy' as const,
        latencyMs: Date.now() - healthStart,
      },
      {
        name: 'Agent Registry',
        status: agentNames.length > 0 ? ('healthy' as const) : ('degraded' as const),
        message: `${agentNames.length} agents available`,
      },
      {
        name: 'Google AI Connection',
        status: vertexHealth.connected ? ('healthy' as const) : ('unhealthy' as const),
        message: vertexHealth.connected ? 'Connected' : 'No API key configured',
      },
    ];

    // Google products status
    const googleProducts = [
      {
        name: 'Gemini 3 Flash',
        status: vertexHealth.connected ? ('connected' as const) : ('disconnected' as const),
      },
      {
        name: 'Veo 3.1',
        status: vertexHealth.connected ? ('connected' as const) : ('disconnected' as const),
      },
      {
        name: 'Imagen 3',
        status: vertexHealth.connected ? ('connected' as const) : ('disconnected' as const),
      },
      {
        name: 'Deep Research',
        status: vertexHealth.connected ? ('connected' as const) : ('disconnected' as const),
      },
      {
        name: 'NotebookLM',
        status: vertexHealth.connected ? ('connected' as const) : ('disconnected' as const),
      },
      {
        name: 'Document AI',
        status: vertexHealth.connected ? ('connected' as const) : ('disconnected' as const),
      },
      {
        name: 'Vertex AI',
        status: vertexHealth.projectId ? ('connected' as const) : ('disconnected' as const),
      },
      {
        name: 'Google Slides',
        status: process.env.GOOGLE_CLIENT_EMAIL
          ? ('connected' as const)
          : ('disconnected' as const),
      },
      {
        name: 'Google Sheets',
        status: process.env.GOOGLE_CLIENT_EMAIL
          ? ('connected' as const)
          : ('disconnected' as const),
      },
      {
        name: 'Gmail',
        status: process.env.GOOGLE_CLIENT_EMAIL
          ? ('connected' as const)
          : ('disconnected' as const),
      },
      {
        name: 'Search Console',
        status: process.env.GOOGLE_CLIENT_EMAIL
          ? ('connected' as const)
          : ('disconnected' as const),
      },
      {
        name: 'Firebase',
        status: process.env.FIREBASE_PROJECT_ID
          ? ('connected' as const)
          : ('disconnected' as const),
      },
    ];

    // Determine overall status
    const unhealthyCount = components.filter((c) => c.status === 'unhealthy').length;
    const degradedCount = components.filter((c) => c.status === 'degraded').length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthyCount > 0) overallStatus = 'unhealthy';
    else if (degradedCount > 0) overallStatus = 'degraded';

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Date.now() - startTime,
      components,
      agents: {
        total: agentNames.length,
        ready: agentNames.length,
        names: agentNames,
      },
      googleProducts,
    };

    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(healthStatus, { status: statusCode });
  } catch (error: any) {
    const errorResponse: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: Date.now() - startTime,
      components: [
        {
          name: 'Health Check',
          status: 'unhealthy',
          message: error.message,
        },
      ],
      agents: { total: 0, ready: 0, names: [] },
      googleProducts: [],
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}
