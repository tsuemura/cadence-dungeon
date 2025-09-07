import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    https: false, // 一時的にHTTPで起動
    port: 3000
  },
  build: {
    target: 'esnext'
  }
})