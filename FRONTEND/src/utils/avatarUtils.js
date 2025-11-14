// Avatar color palette - 10 pastel colors
const AVATAR_COLORS = [
    '#FF6B9D', // różowy
    '#C44569', // bordowy
    '#FEA47F', // pomarańczowy
    '#F8B500', // żółty
    '#3DC1D3', // turkusowy
    '#778BEB', // niebieski
    '#786FA6', // fioletowy
    '#63CDDA', // jasny niebieski
    '#EA8685', // łososiowy
    '#F8D49D'  // beżowy
];

/**
 * Generates a deterministic avatar color based on a name or identifier
 * @param {string} name - The name or identifier to generate color from
 * @returns {string} Hex color code
 */
export const getAvatarColor = (name) => {
    if (!name) return AVATAR_COLORS[0];
    const asciiSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return AVATAR_COLORS[asciiSum % 10];
};

/**
 * Gets the first letter from a name for avatar display
 * @param {string} name - The name to extract letter from
 * @returns {string} Uppercase first letter
 */
export const getAvatarLetter = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
};

/**
 * Generates avatar properties for a user
 * @param {Object} user - User object with optional first_name, last_name, email, or name fields
 * @returns {Object} { letter, color, bgColor }
 */
export const generateAvatarProps = (user) => {
    if (!user) {
        return {
            letter: '?',
            color: '#ffffff',
            bgColor: AVATAR_COLORS[0]
        };
    }

    // Determine the name to use
    let displayName = '';
    if (user.first_name && user.last_name) {
        displayName = `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
        displayName = user.first_name;
    } else if (user.name) {
        displayName = user.name;
    } else if (user.email) {
        displayName = user.email;
    }

    const letter = getAvatarLetter(displayName);
    const bgColor = getAvatarColor(displayName);

    return {
        letter,
        color: '#ffffff',
        bgColor
    };
};

/**
 * Component-ready avatar object
 * @param {string} avatarUrl - Optional custom avatar URL
 * @param {Object} user - User object
 * @returns {Object} { src, letter, bgColor, hasCustom }
 */
export const getAvatarData = (avatarUrl, user) => {
    const { letter, bgColor } = generateAvatarProps(user);
    
    return {
        src: avatarUrl || null,
        letter,
        bgColor,
        hasCustom: Boolean(avatarUrl)
    };
};
