import { readFileSync } from "node:fs";
import { ApolloServer } from "@apollo/server";
import { resolvers } from "./graphql/resolvers.js";
import type { AppContext } from "./context.js";

// Read the schema file that sits next to this module (works in src/ and dist/).
export const typeDefs = readFileSync(new URL("./graphql/schema.graphql", import.meta.url), "utf8");

/** Kept separate from index.ts so tests can build a server without listening on a port. */
export function createServer(): ApolloServer<AppContext> {
  return new ApolloServer<AppContext>({
    typeDefs,
    resolvers,
    // Show the in-browser Sandbox and allow schema introspection outside production.
    introspection: process.env.NODE_ENV !== "production",
  });
}
