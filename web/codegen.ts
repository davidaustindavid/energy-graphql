import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * The client preset scans our .tsx files for graphql(`...`) calls and
 * generates a fully-typed `graphql()` function. Each query's result and
 * variables types then flow into useQuery/useMutation automatically.
 *
 * Run `npm run codegen` after editing a query (or `-- --watch` while developing).
 */
const config: CodegenConfig = {
  schema: "../server/src/graphql/schema.graphql",
  documents: ["src/**/*.{ts,tsx}", "!src/gql/**"],
  ignoreNoDocuments: true,
  generates: {
    "src/gql/": {
      preset: "client",
      config: { useTypeImports: true, enumsAsTypes: true },
      presetConfig: { fragmentMasking: false },
    },
  },
};

export default config;
