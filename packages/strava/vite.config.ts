import path, { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    dts({
      exclude: './src/vite-env.d.ts',
      tsConfigFilePath: './tsconfig.json',
    }),
  ],
  build: {
    lib: {
      entry: resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        'src/index.ts'
      ),
      name: 'remix-auth-strava-strategy',
      fileName: 'index',
    },
    outDir: './dist',
    sourcemap: true,
    minify: 'esbuild',
  },
})
