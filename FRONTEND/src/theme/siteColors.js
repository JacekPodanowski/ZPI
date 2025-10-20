/**
 * Site Color Palette
 * 
 * A curated palette of 12 colors used to identify different sites in the calendar
 * and throughout the application. Each site is assigned a color index (0-11).
 * 
 * The backend stores only the color_index, keeping the actual color definitions
 * centralized in the frontend theme system.
 */

export const SITE_COLOR_PALETTE = [
    {
        index: 0,
        hex: '#920020',      // Primary Red
        name: 'Crimson',
        light: '#B8002B',
        dark: '#6B0018',
    },
    {
        index: 1,
        hex: '#3B82F6',      // Light Blue
        name: 'Sky Blue',
        light: '#60A5FA',
        dark: '#2563EB',
    },
    {
        index: 2,
        hex: '#10B981',      // Green
        name: 'Emerald',
        light: '#34D399',
        dark: '#059669',
    },
    {
        index: 3,
        hex: '#F59E0B',      // Amber
        name: 'Amber',
        light: '#FBBF24',
        dark: '#D97706',
    },
    {
        index: 4,
        hex: '#8B5CF6',      // Purple
        name: 'Violet',
        light: '#A78BFA',
        dark: '#7C3AED',
    },
    {
        index: 5,
        hex: '#EC4899',      // Pink
        name: 'Rose',
        light: '#F472B6',
        dark: '#DB2777',
    },
    {
        index: 6,
        hex: '#06B6D4',      // Cyan
        name: 'Cyan',
        light: '#22D3EE',
        dark: '#0891B2',
    },
    {
        index: 7,
        hex: '#F97316',      // Orange
        name: 'Orange',
        light: '#FB923C',
        dark: '#EA580C',
    },
    {
        index: 8,
        hex: '#6366F1',      // Indigo
        name: 'Indigo',
        light: '#818CF8',
        dark: '#4F46E5',
    },
    {
        index: 9,
        hex: '#14B8A6',      // Teal
        name: 'Teal',
        light: '#2DD4BF',
        dark: '#0D9488',
    },
    {
        index: 10,
        hex: '#A855F7',      // Violet
        name: 'Purple',
        light: '#C084FC',
        dark: '#9333EA',
    },
    {
        index: 11,
        hex: '#EF4444',      // Red
        name: 'Red',
        light: '#F87171',
        dark: '#DC2626',
    },
];

/**
 * Get the color object for a given color index
 * @param {number} colorIndex - The color index (0-11)
 * @returns {object} The color object with hex, name, light, and dark variants
 */
export const getSiteColor = (colorIndex) => {
    const index = colorIndex % SITE_COLOR_PALETTE.length;
    return SITE_COLOR_PALETTE[index];
};

/**
 * Get just the hex color for a given color index
 * @param {number} colorIndex - The color index (0-11)
 * @returns {string} The hex color code
 */
export const getSiteColorHex = (colorIndex) => {
    return getSiteColor(colorIndex).hex;
};

/**
 * Get the light variant of a color for a given color index
 * @param {number} colorIndex - The color index (0-11)
 * @returns {string} The light hex color code
 */
export const getSiteColorLight = (colorIndex) => {
    return getSiteColor(colorIndex).light;
};

/**
 * Get the dark variant of a color for a given color index
 * @param {number} colorIndex - The color index (0-11)
 * @returns {string} The dark hex color code
 */
export const getSiteColorDark = (colorIndex) => {
    return getSiteColor(colorIndex).dark;
};

/**
 * Get the color name for a given color index
 * @param {number} colorIndex - The color index (0-11)
 * @returns {string} The color name
 */
export const getSiteColorName = (colorIndex) => {
    return getSiteColor(colorIndex).name;
};
