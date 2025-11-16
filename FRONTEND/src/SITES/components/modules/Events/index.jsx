import { EVENTS_DEFAULTS, EVENTS_DESCRIPTOR } from './descriptor';
import ListEvents from './layouts/ListEvents';

const LAYOUTS = {
  list: ListEvents,
  grid: ListEvents,
  timeline: ListEvents
};

const EventsSection = ({ layout = 'list', content = {}, style }) => {
  const defaultOptions = EVENTS_DEFAULTS[layout] || EVENTS_DEFAULTS.list;
  const defaults = Array.isArray(defaultOptions) ? defaultOptions[0] : defaultOptions;
  const mergedContent = { ...defaults, ...content };
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.list;
  return <LayoutComponent content={mergedContent} style={style} />;
};

EventsSection.descriptor = EVENTS_DESCRIPTOR;
export default EventsSection;
