/**
 * GraphQL Root Resolver
 *
 * Combines Query and Mutation resolvers into a single root resolver.
 */

import {Query} from './query';
import {Mutation} from './mutation';
import {GraphQLScalarType, Kind} from 'graphql';

// ─── Custom Scalars ─────────────────────────────────────────────────────────

// JSON scalar type
const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'Arbitrary JSON value',
  serialize: (value: any) => value,
  parseValue: (value: any) => value,
  parseLiteral: (ast: any) => {
    if (ast.kind === Kind.STRING) {
      return JSON.parse(ast.value);
    }
    return null;
  },
});

// DateTime scalar type
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO 8601 date-time string',
  serialize: (value: any) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  },
  parseValue: (value: any) => {
    return new Date(value);
  },
  parseLiteral: (ast: any) => {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

// ─── Root Resolver ──────────────────────────────────────────────────────────

export const resolvers = {
  Query,
  Mutation,
  JSON: JSONScalar,
  DateTime: DateTimeScalar,
};
