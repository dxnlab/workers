import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        worker: 'src/worker/index.ts',
        shared: 'src/shared/index.ts',
        service: 'src/service/index.ts',
      },
    },
    rolldownOptions: {
      external: ['vue','react']
    }
  },
})