import { defineConfig } from "vite";
import vue from '@vitejs/plugin-vue'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  base: './',
  mode: 'development',
  publicDir: 'docs',
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    rolldownOptions: {
      tsconfig: './tsconfig.preview.json'
    },
    outDir: './docs'
  },
  plugins: [
    vue(),
    babel({
      // @ts-ignore
      presets: [{
        preset: ()=>({
          plugins: [[
              "@babel/plugin-proposal-decorators", 
              { "version": "2023-11" }
          ]]
        }),
        rolldown: { filter: { code: '@' } }
      }]
    }),
  ],
})