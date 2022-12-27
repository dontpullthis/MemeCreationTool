
/**
 * Check if the specified font exists.
 * @param font e.g. "16px Arial"
 * @returns true if font exists, false otherwise
 */
export const isFontAvailable = (font: string): boolean => {
	let result = false;
	try {
		result = document.fonts.check(font);
	} catch (DOMEXception) {
		result = false;
	}

	return result;
};