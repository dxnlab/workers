import { defineConfig } from 'vite'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        worker: 'src/worker.ts',
        shared: 'src/shared.ts',
        service: 'src/service.ts',
      },
    },
    rolldownOptions: {
      external: ['vue','react']
    }
  },
  plugins: [
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