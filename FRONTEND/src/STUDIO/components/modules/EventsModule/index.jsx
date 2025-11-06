import { EVENTS_DEFAULTS, EVENTS_DESCRIPTOR } from './descriptor';
import ListEvents from './layouts/ListEvents';

const LAYOUTS = {
  list: ListEvents,
  grid: ListEvents,
  timeline: ListEvents
};

const EventsModule = ({ layout = 'list', content = {}, vibe, theme }) => {
  const defaults = EVENTS_DEFAULTS[layout] || EVENTS_DEFAULTS.list;
  const mergedContent = { ...defaults, ...content };
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.list;
  return <LayoutComponent content={mergedContent} vibe={vibe} theme={theme} />;
};

EventsModule.descriptor = EVENTS_DESCRIPTOR;
export default EventsModule;
