/**
 * Smart Prop Type Detection
 * Ported from old editor (Configurator.jsx)
 * 
 * Automatically determines the appropriate input field type
 * based on the property key name and value.
 */

// Media-related keywords
const MEDIA_KEYWORDS = ['image', 'video', 'url', 'src', 'media', 'photo', 'picture'];

/**
 * Determines the field type for a given property
 * @param {string} key - Property key name
 * @param {*} value - Property value
 * @returns {string} Field type: 'boolean' | 'color' | 'image' | 'textarea' | 'text'
 */
export const getFieldType = (key, value) => {
  const lowerKey = key.toLowerCase();

  // 1. Check value type for booleans
  if (typeof value === 'boolean') {
    return 'boolean';
  }

  // 2. Check key for media keywords
  if (MEDIA_KEYWORDS.some(keyword => lowerKey.includes(keyword))) {
    return 'image';
  }

  // 3. Check key for color keywords
  if (lowerKey.includes('color') || lowerKey.includes('bg') || lowerKey.includes('background')) {
    return 'color';
  }

  // 4. Check key for long text keywords
  if (lowerKey.includes('description') || lowerKey.includes('content') || lowerKey.includes('body')) {
    return 'textarea';
  }

  // 5. Check string length for long content
  if (typeof value === 'string' && value.length > 120) {
    return 'textarea';
  }

  // 6. Default to text input
  return 'text';
};

/**
 * Formats property keys into human-readable labels
 * @param {string} propKey - Property key in camelCase or snake_case
 * @returns {string} Formatted label
 */
export const formatPropLabel = (propKey) => {
  // Common property labels (can be extended)
  const PROP_LABELS = {
    eyebrow: 'Eyebrow Text',
    title: 'Title',
    titleColor: 'Title Color',
    description: 'Description',
    textColor: 'Text Color',
    accentColor: 'Accent Color',
    ctaLabel: 'Button Text',
    ctaBg: 'Button Background',
    ctaTextColor: 'Button Text Color',
    ctaHref: 'Button Link',
    ctaTarget: 'Link Target',
    imageUrl: 'Image URL',
    imageAlt: 'Image Alt Text',
    videoUrl: 'Video URL',
    bgColor: 'Background Color',
    heading: 'Heading',
    subheading: 'Subheading'
  };

  // Return custom label if exists
  if (PROP_LABELS[propKey]) {
    return PROP_LABELS[propKey];
  }

  // Convert camelCase or snake_case to Title Case
  const spaced = propKey
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim();

  if (!spaced.length) {
    return propKey;
  }

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/**
 * Gets helper text for a property (optional guidance)
 * @param {string} key - Property key name
 * @returns {string|null} Helper text or null
 */
export const getPropHelper = (key) => {
  const PROP_HELPERS = {
    eyebrow: 'Short label that appears above the title',
    description: 'Describe your offer or module in one paragraph',
    ctaLabel: 'Text displayed on the call-to-action button',
    ctaBg: 'Background color of the CTA button',
    ctaTextColor: 'Text color of the CTA button',
    ctaHref: 'Full URL. Leave empty if button should not be a link',
    ctaTarget: '_self (same tab) or _blank (new tab)',
    imageAlt: 'Alternative text for accessibility and SEO',
    videoUrl: 'YouTube, Vimeo, or direct video file URL'
  };

  return PROP_HELPERS[key] || null;
};

/**
 * Validates if a value matches the expected field type
 * @param {*} value - Value to validate
 * @param {string} fieldType - Expected field type
 * @returns {boolean} True if valid
 */
export const validateFieldValue = (value, fieldType) => {
  switch (fieldType) {
    case 'boolean':
      return typeof value === 'boolean';
    case 'color':
      // Basic hex color validation
      return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value);
    case 'image':
      return typeof value === 'string' && value.length > 0;
    case 'textarea':
    case 'text':
      return typeof value === 'string';
    default:
      return true;
  }
};
