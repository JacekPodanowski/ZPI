/**
 * Utility functions for generating site URLs based on routing mode
 */

/**
 * Generates the public URL for a site based on the current routing mode
 * @param {string} siteIdentifierOrSubdomain - The site identifier (e.g., "1-pracownia-jogi") or full subdomain from backend
 * @returns {string} The full URL to the site
 */
export const getSiteUrl = (siteIdentifierOrSubdomain) => {
  const routingMode = import.meta.env.VITE_APP_ROUTING_MODE;
  
  if (routingMode === 'path') {
    // Development mode: localhost:3000/viewer/nazwa-strony
    const baseUrl = window.location.origin;
    return `${baseUrl}/viewer/${siteIdentifierOrSubdomain}`;
  } else {
    // Production mode (subdomain): 1-nazwa-strony.youreasysite.pl
    // If already includes domain, use as-is, otherwise append .youreasysite.pl
    if (siteIdentifierOrSubdomain.includes('.')) {
      return `https://${siteIdentifierOrSubdomain}`;
    }
    return `https://${siteIdentifierOrSubdomain}.youreasysite.pl`;
  }
};

/**
 * Generates a display-friendly URL string for a site
 * @param {string} siteIdentifierOrSubdomain - The site identifier or full subdomain from backend
 * @returns {string} Display text for the URL
 */
export const getSiteUrlDisplay = (siteIdentifierOrSubdomain) => {
  const routingMode = import.meta.env.VITE_APP_ROUTING_MODE;
  
  if (routingMode === 'path') {
    // Show relative path in development
    return `/viewer/${siteIdentifierOrSubdomain}`;
  } else {
    // Show production domain - if already includes domain, use as-is
    if (siteIdentifierOrSubdomain.includes('.')) {
      return siteIdentifierOrSubdomain;
    }
    return `${siteIdentifierOrSubdomain}.youreasysite.pl`;
  }
};
