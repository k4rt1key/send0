import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxy requests starting with /api to the backend
      '/api': {
        target: `http://localhost:6000/api`, 
        changeOrigin: true,            
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
