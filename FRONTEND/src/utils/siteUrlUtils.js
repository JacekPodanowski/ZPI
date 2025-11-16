/**
 * Utility functions for generating site URLs based on routing mode
 */

/**
 * Generates the public URL for a site based on the current routing mode
 * @param {string} siteIdentifier - The site identifier (e.g., "pracownia-jogi")
 * @returns {string} The full URL to the site
 */
export const getSiteUrl = (siteIdentifier) => {
  const routingMode = import.meta.env.VITE_APP_ROUTING_MODE;
  
  if (routingMode === 'path') {
    // Development mode: localhost:3000/viewer/nazwa-strony
    const baseUrl = window.location.origin;
    return `${baseUrl}/viewer/${siteIdentifier}`;
  } else {
    // Production mode (subdomain): nazwa-strony.youreasysite.com
    return `https://${siteIdentifier}.youreasysite.com`;
  }
};

/**
 * Generates a display-friendly URL string for a site
 * @param {string} siteIdentifier - The site identifier
 * @returns {string} Display text for the URL
 */
export const getSiteUrlDisplay = (siteIdentifier) => {
  const routingMode = import.meta.env.VITE_APP_ROUTING_MODE;
  
  if (routingMode === 'path') {
    // Show relative path in development
    return `/viewer/${siteIdentifier}`;
  } else {
    // Show production domain
    return `${siteIdentifier}.youreasysite.com`;
  }
};
