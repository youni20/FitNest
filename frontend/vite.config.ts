import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // <-- Add this line to bind to all addresses
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001', // backend proxy
    },
  },
});
