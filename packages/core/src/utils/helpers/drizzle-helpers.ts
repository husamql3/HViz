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
