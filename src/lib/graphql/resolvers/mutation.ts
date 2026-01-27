/**
 * GraphQL Mutation Resolvers
 *
 * Handles all write operations for the GraphQL API.
 */

import {AgentRegistry, initializeAgents} from '@/agents/registry';
import {encrypt} from '@/lib/encryption';
import type {GraphQLContext} from '../context';

export const Mutation = {
  // ─── Agent Execution ──────────────────────────────────────────────────────

  invokeAgent: async (
    _parent: any,
    args: {agentName: string; mission: string; config?: any},
    ctx: GraphQLContext
  ) => {
    const {userId} = ctx;

    if (!userId) {
      throw new Error('Unauthorized: Authentication required');
    }

    try {
      await initializeAgents();
      const overseer = AgentRegistry.get('mission-overseer');

      if (!overseer) {
        throw new Error('Mission Overseer not available');
      }

      // Create mission context
      const context = {
        userId,
        mission: args.mission,
        config: {
          ...args.config,
          explicitAgents: [args.agentName],
        },
      };

      // Execute mission lifecycle
      const plan = await overseer.plan(context);
      const result = await overseer.execute(plan, context);
      const verification = await overseer.verify(result, context);

      // Store mission in database
      const missionRecord = await ctx.prisma.mission.create({
        data: {
          status: verification.passed ? 'COMPLETED' : 'FAILED',
          plan: plan as any,
          result: result as any,
          audit: verification as any,
          cost: result.cost || 0,
          userId,
        },
      });

      return {
        success: verification.passed,
        missionId: missionRecord.id,
        error: verification.passed ? null : 'Mission verification failed',
      };
    } catch (error: any) {
      console.error('[GraphQL] Error invoking agent:', error);
      return {
        success: false,
        missionId: null,
        error: error.message,
      };
    }
  },

  // ─── Job Queue ────────────────────────────────────────────────────────────

  createJob: async (
    _parent: any,
    args: {
      queue: string;
      name: string;
      payload: any;
      priority?: number;
      delay?: number;
    },
    ctx: GraphQLContext
  ) => {
    const {taskQueue, userId} = ctx;

    if (!userId) {
      throw new Error('Unauthorized: Authentication required');
    }

    try {
      const result = await taskQueue.addJob(
        args.queue,
        args.name,
        args.payload,
        {
          userId,
          priority: args.priority,
          delay: args.delay,
        }
      );

      return {
        success: result.success,
        jobId: result.jobId,
        dbJobId: result.dbJobId,
        error: result.error,
      };
    } catch (error: any) {
      console.error('[GraphQL] Error creating job:', error);
      return {
        success: false,
        jobId: null,
        dbJobId: null,
        error: error.message,
      };
    }
  },

  // ─── Webhooks ─────────────────────────────────────────────────────────────

  createWebhook: async (
    _parent: any,
    args: {url: string; events: string[]; secret: string},
    ctx: GraphQLContext
  ) => {
    const {prisma, userId} = ctx;

    if (!userId) {
      throw new Error('Unauthorized: Authentication required');
    }

    try {
      // Encrypt webhook secret
      const encryptedSecret = encrypt(args.secret);

      const webhook = await prisma.webhookEndpoint.create({
        data: {
          url: args.url,
          secret: encryptedSecret,
          events: args.events,
          userId,
        },
      });

      return {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        isActive: webhook.isActive,
        createdAt: webhook.createdAt,
      };
    } catch (error: any) {
      console.error('[GraphQL] Error creating webhook:', error);
      throw new Error(`Failed to create webhook: ${error.message}`);
    }
  },
};
