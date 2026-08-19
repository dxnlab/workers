import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: [
        'src/index.ts',
        'src/vue.ts',
        'src/react.ts',
      ],
    },
    rolldownOptions: {
      external: ['vue','react']
    }
  },
})