import { defineConfig } from "vite";

export default defineConfig({
  base: './',
  mode: 'development',
  publicDir: 'docs',
  resolve: {
    alias: {
      '@/*': '../src/*',
    }
  },
  server: {
    port: 5174,
  }
})