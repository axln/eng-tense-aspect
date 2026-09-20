import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

// The version shown on the page. CI bumps package.json before the build, so the
// deployed page carries the same version that is then committed back to main.
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf-8"));

// https://vite.dev/config/
export default defineConfig({
  // The site is served from https://axln.github.io/eng-tense-aspect/, so every
  // asset URL needs this prefix. Vite adds it to index.html by itself; a path
  // written in a component has to use import.meta.env.BASE_URL.
  base: "/eng-tense-aspect/",
  plugins: [tailwindcss(), svelte()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  test: {
    include: ["src/**/*.test.ts"]
  }
});
