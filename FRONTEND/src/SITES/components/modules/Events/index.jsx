import { EVENTS_DEFAULTS, EVENTS_DESCRIPTOR } from './descriptor';
import ListEvents from './layouts/ListEvents';
import GridEvents from './layouts/GridEvents';
import TimelineEvents from './layouts/TimelineEvents';

const LAYOUTS = {
  list: ListEvents,
  grid: GridEvents,
  timeline: TimelineEvents
};

const EventsSection = ({ layout = 'list', content = {}, style, siteIdentifier }) => {
  const defaultOptions = EVENTS_DEFAULTS[layout] || EVENTS_DEFAULTS.list;
  const defaults = Array.isArray(defaultOptions) ? defaultOptions[0] : defaultOptions;
  const mergedContent = { ...defaults, ...content };
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.list;
  return <LayoutComponent content={mergedContent} style={style} siteIdentifier={siteIdentifier} />;
};

EventsSection.descriptor = EVENTS_DESCRIPTOR;
export default EventsSection;
