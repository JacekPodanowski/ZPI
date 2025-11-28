import React, { memo } from 'react';
import { SPACER_DEFAULTS } from './defaults';
import { SPACER_DESCRIPTOR } from './descriptor';
import SmallSpacer from './layouts/SmallSpacer';
import MediumSpacer from './layouts/MediumSpacer';
import LargeSpacer from './layouts/LargeSpacer';

const LAYOUTS = {
  small: SmallSpacer,
  medium: MediumSpacer,
  large: LargeSpacer
};

const SpacerModule = memo(({ size = 'medium', content = {}, style }) => {
  const defaultOptions = SPACER_DEFAULTS[size] || SPACER_DEFAULTS.medium;
  const defaults = Array.isArray(defaultOptions) ? defaultOptions[0] : defaultOptions;
  const mergedContent = { ...defaults, ...content };
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.medium;
  return <LayoutComponent content={mergedContent} style={style} />;
});

SpacerModule.displayName = 'SpacerModule';
SpacerModule.descriptor = SPACER_DESCRIPTOR;
export default SpacerModule;
