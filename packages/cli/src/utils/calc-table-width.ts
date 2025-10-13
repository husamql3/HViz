import type { Field } from "@/types/erd.type";

export const calcTableWidth = (fields: Field[]) => {
	const iconWidth = 80; // Space for icons (up to 4 icons at ~16px each + gaps)
	const typeTagWidth = 40; // Base width for type tag with padding
	const paddingAndMargins = 48; // Padding + margins (px-4 = 16px * 2 + gap)
	const minWidth = 280; // Minimum width for readability
	const maxWidth = 600; // Maximum width to prevent overly wide tables

	// Find the longest field name + type combination
	const longestField = fields.reduce((max, field) => {
		const nameLength = field.name.length;
		const typeLength = field.type.length;
		const totalLength = nameLength + typeLength;
		return totalLength > max ? totalLength : max;
	}, 0);

	// Approximate character width in pixels (monospace font, text-sm ~7px per char)
	const charWidth = 7;
	const calculatedWidth = longestField * charWidth + iconWidth + typeTagWidth + paddingAndMargins;

	// Clamp between min and max
	return Math.min(Math.max(calculatedWidth, minWidth), maxWidth);
};
