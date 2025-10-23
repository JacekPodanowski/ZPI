/**
 * Layout constants for the application
 * These values should match the actual component dimensions
 */

export const NAV_HEIGHT = 60; // Navigation bar height in pixels

export const getFullHeightWithoutNav = () => `calc(100vh - ${NAV_HEIGHT}px)`;
export const getFullHeightWithoutNavPx = () => `100vh - ${NAV_HEIGHT}px`;
