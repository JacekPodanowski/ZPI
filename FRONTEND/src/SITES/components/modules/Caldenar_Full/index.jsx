import React from 'react';
import { mergeWithDefaults } from '../../../../utils/contentMerge';
import FullWidthCalendar from './layouts/FullWidthCalendar';
import { PUBLIC_CALENDAR_BIG_DEFAULTS } from './defaults';
import { PUBLIC_CALENDAR_BIG_DESCRIPTOR } from './descriptor';

const LAYOUTS = {
  default: FullWidthCalendar
};

const PublicCalendarBigModule = ({ layout = 'default', content = {}, style, siteId }) => {
  const defaults = PUBLIC_CALENDAR_BIG_DEFAULTS[layout] || PUBLIC_CALENDAR_BIG_DEFAULTS.default;
  const mergedContent = mergeWithDefaults(defaults, content);
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.default;

  return <LayoutComponent content={mergedContent} style={style} siteId={siteId} />;
};

PublicCalendarBigModule.descriptor = PUBLIC_CALENDAR_BIG_DESCRIPTOR;
export default PublicCalendarBigModule;
