import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  base: "./",
  server: {
    port: 5173,
    host: "0.0.0.0",
    open: false,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "es2022",
  },
  preview: {
    port: 4173,
    host: "0.0.0.0",
  },
});
