import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Forward /graphql to the API so the browser sees one origin (no CORS setup).
    proxy: { "/graphql": { target: "http://localhost:4000", rewrite: () => "/" } },
  },
});
