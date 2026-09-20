import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  // The site is served from https://axln.github.io/eng-tense-aspect/, so every
  // asset URL needs this prefix. Vite adds it to index.html by itself; a path
  // written in a component has to use import.meta.env.BASE_URL.
  base: "/eng-tense-aspect/",
  plugins: [tailwindcss(), svelte()],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  test: {
    include: ["src/**/*.test.ts"]
  }
});
