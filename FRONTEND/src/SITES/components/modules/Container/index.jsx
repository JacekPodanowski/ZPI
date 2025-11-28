import React, { memo } from 'react';
import { CONTAINER_DEFAULTS, CONTAINER_DESCRIPTOR } from '../_descriptors';
import FlexContainer from './layouts/FlexContainer';

const LAYOUTS = {
  flex: FlexContainer,
  grid: FlexContainer
};

const ContainerModule = memo(({ layout = 'flex', content = {}, style }) => {
  const defaults = CONTAINER_DEFAULTS[layout] || CONTAINER_DEFAULTS.flex;
  const mergedContent = { ...defaults, ...content };
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.flex;
  return <LayoutComponent content={mergedContent} style={style} />;
});

ContainerModule.displayName = 'ContainerModule';
ContainerModule.descriptor = CONTAINER_DESCRIPTOR;
export default ContainerModule;
