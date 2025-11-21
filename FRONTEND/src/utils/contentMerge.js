export const mergeWithDefaults = (defaults = {}, content = {}) => {
  if (Array.isArray(defaults)) {
    if (!Array.isArray(content) || content.length === 0) {
      return defaults;
    }
    return content.map((entry, index) => {
      const defaultEntry = defaults[index] ?? defaults[0];
      if (defaultEntry && typeof defaultEntry === 'object' && !Array.isArray(defaultEntry)) {
        return mergeWithDefaults(defaultEntry, entry);
      }
      return entry === undefined || entry === '' ? defaultEntry : entry;
    });
  }

  if (defaults === null || typeof defaults !== 'object') {
    if (content === undefined || content === null) {
      return defaults;
    }
    return content;
  }

  const merged = { ...defaults };

  if (!content || typeof content !== 'object') {
    return merged;
  }

  Object.entries(content).forEach(([key, value]) => {
    const defaultValue = defaults[key];

    if ((value === undefined || value === null) && defaultValue !== undefined) {
      return;
    }

    if (Array.isArray(defaultValue)) {
      merged[key] = mergeWithDefaults(defaultValue, value);
      return;
    }

    if (defaultValue && typeof defaultValue === 'object') {
      merged[key] = mergeWithDefaults(defaultValue, value);
      return;
    }

    merged[key] = value;
  });

  return merged;
};
