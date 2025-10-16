/**
 * Animation Utilities for Studio Dashboard
 * 
 * Defines timing, easing curves, and reusable animation configurations
 * for the intelligent mode switching system.
 */

// ========== Transition Durations (in milliseconds) ==========
export const TRANSITION_DURATIONS = {
    COLLAPSE: 350,           // Site selector collapse animation
    EXPAND: 300,             // Site selector expand animation
    SITE_CARD_FADE: 100,     // Individual site card fade
    BUTTON_FADE: 170,        // Site button fade in collapsed view
    CHEVRON_ROTATE: 200,     // Chevron icon rotation
    CALENDAR_RESIZE: 350,    // Calendar height transition
    TEMPLATE_RESIZE: 300,    // Template library width transition
    MODAL_FADE: 250          // Modal appear/disappear
};

// ========== Easing Curves ==========
// Using cubic-bezier arrays for Framer Motion compatibility
export const EASING_CURVES = {
    STANDARD: [0.4, 0, 0.2, 1],        // Material Design standard curve
    BOUNCE: [0.34, 1.56, 0.64, 1],     // Playful bounce effect
    EASE_OUT: [0, 0, 0.2, 1],          // Deceleration
    EASE_IN_OUT: [0.4, 0, 0.6, 1],     // Smooth acceleration/deceleration
    EASE_IN: [0.4, 0, 1, 1]            // Acceleration
};

// ========== Site Selector Animations ==========

/**
 * Collapse animation: Site Management → Calendar Power
 * Height: 240px → 50px
 */
export const collapseAnimation = {
    initial: { height: 240, opacity: 1 },
    animate: { height: 50, opacity: 1 },
    exit: { height: 240, opacity: 1 },
    transition: {
        duration: TRANSITION_DURATIONS.COLLAPSE / 1000,
        ease: [0.4, 0, 0.2, 1] // STANDARD curve in array format
    }
};

/**
 * Expand animation: Calendar Power → Site Management
 * Height: 50px → 240px
 */
export const expandAnimation = {
    initial: { height: 50, opacity: 1 },
    animate: { height: 240, opacity: 1 },
    exit: { height: 50, opacity: 1 },
    transition: {
        duration: TRANSITION_DURATIONS.EXPAND / 1000,
        ease: [0.34, 1.56, 0.64, 1] // BOUNCE curve for playful expansion
    }
};

// ========== Site Card Animations ==========

/**
 * Staggered fade animation for site cards
 * @param {number} index - Card index for stagger delay
 * @param {boolean} fadeOut - True for fade out, false for fade in
 * @returns {Object} Framer Motion animation config
 */
export const siteCardStaggerFade = (index, fadeOut = false) => ({
    initial: {
        opacity: fadeOut ? 1 : 0,
        scale: fadeOut ? 1 : 0.97,
        y: fadeOut ? 0 : 20
    },
    animate: {
        opacity: fadeOut ? 0 : 1,
        scale: fadeOut ? 0.97 : 1,
        y: fadeOut ? -10 : 0
    },
    transition: {
        delay: index * 0.1, // 100ms stagger between cards
        duration: TRANSITION_DURATIONS.SITE_CARD_FADE / 1000,
        ease: EASING_CURVES.EASE_OUT
    }
});

/**
 * Site card selection animation
 */
export const siteCardSelectAnimation = {
    scale: [1, 1.03, 1],
    transition: {
        duration: 0.2,
        ease: EASING_CURVES.EASE_IN_OUT
    }
};

// ========== Site Button Animations ==========

/**
 * Site button fade-in for collapsed state
 * @param {number} index - Button index for stagger
 * @returns {Object} Animation config
 */
export const siteButtonFadeIn = (index) => ({
    initial: { opacity: 0, y: -6 },
    animate: { opacity: 1, y: 0 },
    transition: {
        delay: 0.18 + (index * 0.03), // Start at 180ms, +30ms per button
        duration: TRANSITION_DURATIONS.BUTTON_FADE / 1000,
        ease: EASING_CURVES.EASE_IN
    }
});

/**
 * Site button fade-out when expanding
 * @param {number} index - Button index for reverse stagger
 * @returns {Object} Animation config
 */
export const siteButtonFadeOut = (index, totalButtons) => ({
    initial: { opacity: 1, y: 0 },
    animate: { opacity: 0, y: -6 },
    transition: {
        delay: (totalButtons - index - 1) * 0.025, // Reverse order
        duration: TRANSITION_DURATIONS.SITE_CARD_FADE / 1000,
        ease: EASING_CURVES.EASE_OUT
    }
});

// ========== Chevron Animation ==========

/**
 * Chevron rotation (up ⇄ down)
 * @param {boolean} isExpanded - Current state
 * @returns {Object} Animation config
 */
export const chevronRotation = (isExpanded) => ({
    rotate: isExpanded ? 180 : 0,
    transition: {
        duration: TRANSITION_DURATIONS.CHEVRON_ROTATE / 1000,
        ease: EASING_CURVES.EASE_IN_OUT
    }
});

// ========== Calendar Animations ==========

/**
 * Calendar height transition
 * @param {string} mode - 'site-focus' | 'calendar-focus'
 * @returns {Object} Animation config
 */
export const calendarHeightAnimation = (mode) => ({
    height: mode === 'calendar-focus' ? 850 : 650,
    transition: {
        duration: TRANSITION_DURATIONS.CALENDAR_RESIZE / 1000,
        ease: [0.4, 0, 0.2, 1]
    }
});

/**
 * Event dot to block morphing animation
 */
export const eventMorphAnimation = {
    layout: true, // Framer Motion layout animation
    transition: {
        duration: 0.3,
        ease: EASING_CURVES.STANDARD
    }
};

// ========== Template Library Animations ==========

/**
 * Template library width transition
 * @param {string} mode - Current mode
 * @returns {Object} Animation config
 */
export const templateLibraryWidthAnimation = (mode) => ({
    width: mode === 'calendar-focus' ? 240 : 180,
    transition: {
        duration: TRANSITION_DURATIONS.TEMPLATE_RESIZE / 1000,
        ease: [0.4, 0, 0.2, 1]
    }
});

/**
 * Template card drag animation
 */
export const templateDragAnimation = {
    scale: 0.85,
    rotate: 2,
    opacity: 0.9,
    transition: {
        duration: 0.15,
        ease: EASING_CURVES.EASE_OUT
    }
};

/**
 * Template drop animation
 */
export const templateDropAnimation = {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
        duration: 0.2,
        ease: EASING_CURVES.BOUNCE
    }
};

// ========== Modal Animations ==========

/**
 * Modal fade and slide in from center
 */
export const modalEnterAnimation = {
    initial: {
        opacity: 0,
        scale: 0.95,
        y: -20
    },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 20
    },
    transition: {
        duration: TRANSITION_DURATIONS.MODAL_FADE / 1000,
        ease: EASING_CURVES.STANDARD
    }
};

/**
 * Backdrop fade animation
 */
export const backdropAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
        duration: 0.2
    }
};

// ========== Utility Functions ==========

/**
 * Create a spring animation config
 * @param {Object} options - Spring parameters
 * @returns {Object} Framer Motion spring config
 */
export const createSpringAnimation = ({
    stiffness = 300,
    damping = 30,
    mass = 1
} = {}) => ({
    type: 'spring',
    stiffness,
    damping,
    mass
});

/**
 * Create interrupted animation handler
 * Smoothly reverses or redirects animation mid-flight
 * @param {number} currentProgress - Current animation progress (0-1)
 * @param {number} baseDuration - Base duration in ms
 * @returns {Object} Adjusted animation config
 */
export const handleInterruptedAnimation = (currentProgress, baseDuration) => {
    const remainingProgress = 1 - currentProgress;
    const adjustedDuration = baseDuration * remainingProgress;

    return {
        duration: adjustedDuration / 1000,
        ease: EASING_CURVES.STANDARD
    };
};

/**
 * Calculate stagger delay for list items
 * @param {number} index - Item index
 * @param {number} baseDelay - Base delay in ms
 * @param {number} staggerAmount - Stagger increment in ms
 * @returns {number} Total delay in seconds
 */
export const calculateStaggerDelay = (index, baseDelay = 0, staggerAmount = 100) => {
    return (baseDelay + (index * staggerAmount)) / 1000;
};

export default {
    TRANSITION_DURATIONS,
    EASING_CURVES,
    collapseAnimation,
    expandAnimation,
    siteCardStaggerFade,
    siteCardSelectAnimation,
    siteButtonFadeIn,
    siteButtonFadeOut,
    chevronRotation,
    calendarHeightAnimation,
    eventMorphAnimation,
    templateLibraryWidthAnimation,
    templateDragAnimation,
    templateDropAnimation,
    modalEnterAnimation,
    backdropAnimation,
    createSpringAnimation,
    handleInterruptedAnimation,
    calculateStaggerDelay
};
