export const toCamelCase = (str: string): string => {
	return str.replace(/[_-](\w)/g, (_, letter) => letter.toUpperCase());
};

export const removeIdSuffix = (str: string): string => {
	return str.replace(/[_-]id$/, "");
};

export const pluralize = (str: string): string => {
	if (str.endsWith("y")) return `${str.slice(0, -1)}ies`;
	if (str.endsWith("s")) return str;
	return `${str}s`;
};
