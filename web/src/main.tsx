import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { App } from "./App";
import "./styles.css";

/**
 * One ApolloClient for the whole app. Its InMemoryCache normalizes results,
 * so the same data fetched by two queries is only stored once.
 * PriceSeries has no `id`, so we tell the cache not to try to normalize it.
 */
const client = new ApolloClient({
  link: new HttpLink({ uri: "/graphql" }),
  cache: new InMemoryCache({
    typePolicies: {
      CommodityInfo: { keyFields: ["id"] },
      PriceSeries: { keyFields: false },
      Spread: { keyFields: false },
    },
  }),
});

const root = document.getElementById("root");
if (!root) throw new Error("#root element missing from index.html");

createRoot(root).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>,
);
