import { startStandaloneServer } from "@apollo/server/standalone";
import { AlertStore } from "./data/alert-store.js";
import { EiaSource } from "./data/eia-source.js";
import { PriceService } from "./data/price-service.js";
import { SampleSource } from "./data/sample-source.js";
import type { PriceSource } from "./data/price-source.js";
import { createServer } from "./server.js";

// Load server/.env if it exists (Node 22 built-in, no dotenv package needed).
try {
  process.loadEnvFile();
} catch {
  /* no .env file — that's fine */
}

const apiKey = process.env.EIA_API_KEY?.trim();
const source: PriceSource = apiKey ? new EiaSource(apiKey) : new SampleSource();

// These live for the life of the process and are shared by every request.
const prices = new PriceService(source);
const alerts = new AlertStore();

const server = createServer();
const { url } = await startStandaloneServer(server, {
  listen: { port: Number(process.env.PORT ?? 4000) },
  context: async () => ({ prices, alerts }),
});

console.log(`🚀 GraphQL API ready at ${url}`);
console.log(
  source.kind === "EIA"
    ? "   Using live EIA data."
    : "   Using SYNTHETIC sample data. Add EIA_API_KEY to server/.env for real prices.",
);
