/**
 * GraphQL Yoga Server
 *
 * Exports configured GraphQL Yoga instance for Next.js API routes.
 */

import { createYoga } from 'graphql-yoga';
import { schema } from './schema';
import { createContext } from './context';

export const yoga = createYoga({
  schema,
  context: createContext,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response },
});
