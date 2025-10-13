// src/theme/spacing.js
// Defines the global spacing scale and density defaults.

const createSpacingScale = () => {
  const scale = {};
  for (let step = 0; step <= 16; step += 1) {
    const remValue = (step * 0.25).toFixed(2).replace(/\.00$/, '');
    scale[step] = `${remValue || '0'}rem`;
  }
  return scale;
};

export const spacingScale = createSpacingScale();
export const defaultDensity = 1;
