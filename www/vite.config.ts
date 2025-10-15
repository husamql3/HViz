import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	preview: {
		host: true,
		allowedHosts: ["localhost", "hviz.obl.ee", "hviz.tech"],
	},
});
