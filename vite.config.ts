import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    https: true, // Web Bluetooth APIはHTTPSが必要
    port: 3000
  },
  build: {
    target: 'esnext'
  }
})