/**
 * Unified styling for template selection mode in calendar
 * Provides consistent visual feedback for both day and week template creation
 */

export const TEMPLATE_SELECTION_STYLES = {
    // Base overlay that appears on all selectable days/weeks
    selectableOverlay: {
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(146, 0, 32, 0.1)', // Slightly stronger base overlay
            pointerEvents: 'none',
            zIndex: 5, // Higher z-index to stay above background
            borderRadius: 2,
            transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1)'
        }
    },

    // Hover state overlay - intensifies the effect
    hoverOverlay: {
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(146, 0, 32, 0.18)', // Stronger on hover
            pointerEvents: 'none',
            zIndex: 5, // Higher z-index to stay above background
            borderRadius: 2,
            transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1)'
        }
    },

    // Border styling for selectable days/weeks
    selectableBorder: {
        borderWidth: '2px',
        borderColor: 'rgba(146, 0, 32, 0.5)',
        borderStyle: 'solid'
    },

    // Hover border styling
    hoverBorder: {
        borderWidth: '2px',
        borderColor: 'primary.main',
        borderStyle: 'solid'
    },

    // Box shadow for selectable state
    selectableShadow: {
        boxShadow: '0 0 12px rgba(146, 0, 32, 0.25)'
    },

    // Hover box shadow
    hoverShadow: {
        boxShadow: '0 0 16px rgba(146, 0, 32, 0.3), 0 4px 12px rgba(146, 0, 32, 0.2)'
    }
};

/**
 * Get combined styles for template selection mode
 * @param {Object} options - Configuration options
 * @param {boolean} options.isSelectable - Whether the day/week is selectable
 * @param {boolean} options.isHovered - Whether the day/week is hovered
 * @param {'day' | 'week'} options.mode - Template creation mode
 * @returns {Object} Combined MUI sx styles
 */
export const getTemplateSelectionStyles = ({ isSelectable, isHovered, mode }) => {
    if (!isSelectable) {
        return {};
    }

    const baseStyles = {
        ...TEMPLATE_SELECTION_STYLES.selectableBorder,
        ...TEMPLATE_SELECTION_STYLES.selectableShadow,
        ...TEMPLATE_SELECTION_STYLES.selectableOverlay,
        transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer'
    };

    if (isHovered) {
        return {
            ...baseStyles,
            ...TEMPLATE_SELECTION_STYLES.hoverBorder,
            ...TEMPLATE_SELECTION_STYLES.hoverShadow,
            ...TEMPLATE_SELECTION_STYLES.hoverOverlay
        };
    }

    return baseStyles;
};
