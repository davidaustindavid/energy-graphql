import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * GraphQL Code Generator reads schema.graphql and writes TypeScript types
 * for every resolver. Run `npm run codegen` after changing the schema.
 */
const config: CodegenConfig = {
  schema: "src/graphql/schema.graphql",
  generates: {
    "src/graphql/generated.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        // Use `import type` so the output works with verbatimModuleSyntax.
        useTypeImports: true,
        // Emit enums as string unions ("WTI" | "BRENT") instead of TS enums.
        enumsAsTypes: true,
        // Resolvers receive our typed context as their 3rd argument.
        contextType: "../context.js#AppContext",
        // "Mappers" tell codegen what a resolver PARENT really looks like
        // internally, which can differ from the public GraphQL type.
        // e.g. we store a series' commodity as "WTI", not a CommodityInfo object.
        mappers: {
          PriceSeries: "../data/models.js#SeriesModel",
          Spread: "../data/models.js#SpreadModel",
          PriceAlert: "../data/models.js#AlertModel",
        },
        scalars: { ID: "string" },
      },
    },
  },
};

export default config;
