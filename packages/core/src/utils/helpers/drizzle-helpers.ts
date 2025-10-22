export const toCamelCase = (str: string): string => {
	return str.replace(/[_-](\w)/g, (_, letter) => letter.toUpperCase());
};

export const removeIdSuffix = (str: string): string => {
	return str.replace(/[_-]id$/, "");
};

export const pluralize = (str: string): string => {
	if (str.endsWith("s")) return str;

	if (str.endsWith("y")) {
		const beforeY = str[str.length - 2];
		if (beforeY && ["a", "e", "i", "o", "u"].includes(beforeY.toLowerCase())) {
			return `${str}s`;
		}
		return `${str.slice(0, -1)}ies`;
	}

	return `${str}s`;
};

/**
 * Merges multiple Drizzle schema modules into a single schema object.
 * Takes an array of module paths, imports them, and combines all exports.
 *
 * To handle circular dependencies, we need to import all files first,
 * then combine them after they're all loaded.
 */
export const combineDrizzleSchemas = async (schemaFiles: string[]): Promise<any> => {
	// First, check if there's an index file that exports everything
	const indexFile = schemaFiles.find((file) => file.endsWith("/index.ts") || file.endsWith("/index.js"));

	if (indexFile) {
		// If there's an index file, just use that
		try {
			return await import(indexFile);
		} catch (error) {
			console.warn(`Warning: Could not import index file ${indexFile}:`, error);
		}
	}

	// Otherwise, import all files (allowing circular dependencies to resolve)
	const imports = await Promise.all(
		schemaFiles.map(async (file) => {
			try {
				return await import(file);
			} catch (error) {
				console.warn(`Warning: Could not import Drizzle schema from ${file}:`, error);
				return null;
			}
		}),
	);

	// Then merge all exports
	const mergedSchema: Record<string, any> = {};
	for (const schemaModule of imports) {
		if (schemaModule) {
			Object.assign(mergedSchema, schemaModule);
		}
	}

	return mergedSchema;
};
