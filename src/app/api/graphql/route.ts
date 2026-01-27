/**
 * GraphQL API Endpoint
 *
 * GET  /api/graphql - GraphiQL playground
 * POST /api/graphql - GraphQL queries and mutations
 */

import {yoga} from '@/lib/graphql';

export const dynamic = 'force-dynamic';

export {yoga as GET, yoga as POST};
