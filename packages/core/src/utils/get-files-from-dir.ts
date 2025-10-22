import { readdir, stat } from "node:fs/promises";
import { extname, join } from "node:path";

export async function getFilesFromDir(extensions: string[], path: string): Promise<string[]> {
	const files: string[] = [];

	try {
		const stats = await stat(path);

		if (stats.isFile()) {
			if (extensions.includes(extname(path))) {
				files.push(path);
			}
			return files;
		}

		if (stats.isDirectory()) {
			const entries = await readdir(path, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = join(path, entry.name);

				if (entry.isDirectory()) {
					if (!["node_modules", "dist", "build", ".git"].includes(entry.name)) {
						const subFiles = await getFilesFromDir(extensions, fullPath);
						files.push(...subFiles);
					}
				} else if (entry.isFile() && extensions.includes(extname(entry.name))) {
					files.push(fullPath);
				}
			}
		}
	} catch (_error) {
		console.warn(`Warning: Could not access ${path}`);
	}

	return files;
}
