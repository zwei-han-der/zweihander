import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const markdownDeps = [
  "react-markdown",
  "remark-gfm",
  "rehype-highlight",
  "highlight.js",
];

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        codeSplitting: true,
        manualChunks(id) {
          if (markdownDeps.some((dep) => id.includes(dep))) {
            return "markdown";
          }
        },
      },
    },
  },
});
