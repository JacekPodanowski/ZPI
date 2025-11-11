// index.js
// Central export point for all site styles
// Each style is defined in its own file (e.g., auroraMinimal.js, nocturneBold.js)

import auroraMinimal from './auroraMinimal.js';
import nocturneBold from './nocturneBold.js';
import solsticePastel from './solsticePastel.js';
import verdantOrganic from './verdantOrganic.js';
import lumenEditorial from './lumenEditorial.js';

const createBaseOptions = () => ({
  roundness: 'soft',
  shadowPreset: 'floating',
  borderWidthPreset: 'hairline',
  density: 1,
  fontScale: 1,
  primaryColor: null,
  secondaryColor: null
});

const rawStyles = [
  auroraMinimal,
  nocturneBold,
  solsticePastel,
  verdantOrganic,
  lumenEditorial
];

const orderedStyles = rawStyles.map((style) => ({
  ...style,
  options: createBaseOptions()
}));

export const STYLES = orderedStyles.reduce((acc, style) => {
  acc[style.id] = style;
  return acc;
}, {});

export const STYLE_LIST = orderedStyles;
export const DEFAULT_STYLE_ID = orderedStyles[0]?.id || 'auroraMinimal';

export default STYLES;
