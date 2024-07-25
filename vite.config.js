import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  proxy: {
    "^/api": {
      target: 'http://47.97.211.180:9001',
      changeOrigin: true,
      pathRewrite: {
        "^/api": "/api",
      },
    },
  },
})
