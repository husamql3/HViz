import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	preview: {
		host: "0.0.0.0",
		allowedHosts: [".all"]
	},
});