import React, { memo } from 'react';
import { BUTTON_DEFAULTS } from './defaults';
import { BUTTON_DESCRIPTOR } from './descriptor';
import BlockButton from './layouts/BlockButton';
import InlineButton from './layouts/InlineButton';
import FullWidthButton from './layouts/FullWidthButton';

const LAYOUTS = {
  block: BlockButton,
  inline: InlineButton,
  fullWidth: FullWidthButton
};

const ButtonModule = memo(({ layout = 'block', content = {}, style }) => {
  const defaultOptions = BUTTON_DEFAULTS[layout] || BUTTON_DEFAULTS.block;
  const defaults = Array.isArray(defaultOptions) ? defaultOptions[0] : defaultOptions;
  const mergedContent = { ...defaults, ...content };
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.block;
  return <LayoutComponent content={mergedContent} style={style} />;
});

ButtonModule.displayName = 'ButtonModule';
ButtonModule.descriptor = BUTTON_DESCRIPTOR;
export default ButtonModule;
