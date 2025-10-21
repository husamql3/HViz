import { copyFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

async function copyDir(src: string, dest: string) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  const viewBuildSrc = path.resolve("packages/view/build/client");
  const coreBuildDest = path.resolve("packages/core/view-build");
  const rootBuildDest = path.resolve("view-build");

  console.log("📦 Copying view build to core package...");
  await Promise.all([
    copyDir(viewBuildSrc, coreBuildDest),
    copyDir(viewBuildSrc, rootBuildDest),
  ]);

  console.log("✅ View build copied successfully!");
}

main().catch(console.error);
