/**
 * Compiled GraphQL Schema
 *
 * Combines SDL schema definition with TypeScript resolvers.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { resolvers } from './resolvers';

// Read SDL schema definition
const schemaPath = join(process.cwd(), 'src', 'lib', 'graphql', 'schema.graphql');
const typeDefs = readFileSync(schemaPath, 'utf-8');

// Create executable schema
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
