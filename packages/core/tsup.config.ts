import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  platform: "node",
  outDir: "dist",
  outExtension: () => ({ js: ".js" }),
  clean: true,
  dts: true,
  splitting: false,
  sourcemap: false,
  minify: false,
  shims: true,
  external: ["@prisma/internals"],
  banner: {
    js: "#!/usr/bin/env node",
  },
  esbuildOptions(options) {
    options.mainFields = ["module", "main"];
  },
  onSuccess: async () => {
    // Make the binary executable
    const { chmod } = await import("node:fs/promises");
    await chmod("dist/index.js", 0o755);
    console.log("✅ Binary made executable");
  },
});