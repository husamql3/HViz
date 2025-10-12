import react from "@vitejs/plugin-react-swc";
import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
