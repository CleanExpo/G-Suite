/**
 * GraphQL Query Resolvers
 *
 * Handles all read operations for the GraphQL API.
 */

import {AgentRegistry, initializeAgents} from '@/agents/registry';
import type {GraphQLContext} from '../context';

const startTime = Date.now();

export const Query = {
  // ─── Agents ───────────────────────────────────────────────────────────────

  agents: async () => {
    await initializeAgents();
    const agentNames = AgentRegistry.getAvailableAgents();

    return agentNames.map(name => {
      const agent = AgentRegistry.get(name);
      return {
        name,
        description: agent?.description || 'No description',
        capabilities: agent?.capabilities || [],
        requiredSkills: agent?.requiredSkills || [],
        status: 'ready',
      };
    });
  },

  agent: async (_parent: any, args: {name: string}) => {
    await initializeAgents();
    const agent = AgentRegistry.get(args.name);

    if (!agent) {
      return null;
    }

    return {
      name: args.name,
      description: agent.description || 'No description',
      capabilities: agent.capabilities || [],
      requiredSkills: agent.requiredSkills || [],
      status: 'ready',
    };
  },

  // ─── Missions ─────────────────────────────────────────────────────────────

  missions: async (
    _parent: any,
    args: {limit?: number; status?: string},
    ctx: GraphQLContext
  ) => {
    const {prisma, userId} = ctx;

    if (!userId) {
      throw new Error('Unauthorized: Authentication required');
    }

    return await prisma.mission.findMany({
      where: {
        userId,
        ...(args.status ? {status: args.status} : {}),
      },
      take: args.limit || 25,
      orderBy: {createdAt: 'desc'},
    });
  },

  mission: async (
    _parent: any,
    args: {id: string},
    ctx: GraphQLContext
  ) => {
    const {prisma, userId} = ctx;

    if (!userId) {
      throw new Error('Unauthorized: Authentication required');
    }

    const mission = await prisma.mission.findFirst({
      where: {
        id: args.id,
        userId,
      },
    });

    if (!mission) {
      throw new Error('Mission not found');
    }

    return mission;
  },

  // ─── Jobs ─────────────────────────────────────────────────────────────────

  jobs: async (
    _parent: any,
    args: {queue?: string; status?: string; limit?: number},
    ctx: GraphQLContext
  ) => {
    const {prisma, userId} = ctx;

    if (!userId) {
      throw new Error('Unauthorized: Authentication required');
    }

    return await prisma.queueJob.findMany({
      where: {
        userId,
        ...(args.queue ? {queue: args.queue} : {}),
        ...(args.status ? {status: args.status} : {}),
      },
      take: args.limit || 25,
      orderBy: {createdAt: 'desc'},
    });
  },

  job: async (
    _parent: any,
    args: {id: string},
    ctx: GraphQLContext
  ) => {
    const {prisma, userId} = ctx;

    if (!userId) {
      throw new Error('Unauthorized: Authentication required');
    }

    const job = await prisma.queueJob.findFirst({
      where: {
        id: args.id,
        userId,
      },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    return job;
  },

  // ─── Health ───────────────────────────────────────────────────────────────

  health: async () => {
    await initializeAgents();
    const agentNames = AgentRegistry.getAvailableAgents();

    const googleProducts = [
      {
        name: 'Gemini 3 Flash',
        status: process.env.GOOGLE_API_KEY ? 'connected' : 'disconnected',
      },
      {
        name: 'Vertex AI',
        status: process.env.VERTEX_PROJECT_ID ? 'connected' : 'disconnected',
      },
      {
        name: 'Google Slides',
        status: process.env.GOOGLE_CLIENT_EMAIL
          ? 'connected'
          : 'disconnected',
      },
      {
        name: 'Google Sheets',
        status: process.env.GOOGLE_CLIENT_EMAIL
          ? 'connected'
          : 'disconnected',
      },
      {
        name: 'Gmail',
        status: process.env.GOOGLE_CLIENT_EMAIL
          ? 'connected'
          : 'disconnected',
      },
      {
        name: 'Firebase',
        status: process.env.FIREBASE_PROJECT_ID ? 'connected' : 'disconnected',
      },
    ];

    return {
      status: 'healthy',
      timestamp: new Date(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Date.now() - startTime,
      agents: {
        total: agentNames.length,
        ready: agentNames.length,
        names: agentNames,
      },
      googleProducts,
    };
  },
};
