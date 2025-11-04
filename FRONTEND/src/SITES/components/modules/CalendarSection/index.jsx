// index.jsx - Main CalendarSection component
import { CALENDAR_DEFAULTS } from './defaults';
import { CALENDAR_DESCRIPTOR } from './descriptor';
import CompactCalendar from './layouts/CompactCalendar';
import DetailedCalendar from './layouts/DetailedCalendar';
import ListCalendar from './layouts/ListCalendar';

const LAYOUTS = {
  compact: CompactCalendar,
  detailed: DetailedCalendar,
  list: ListCalendar
};

const CalendarSection = ({ layout = 'compact', content = {}, vibe, theme }) => {
  const defaults = CALENDAR_DEFAULTS[layout] || CALENDAR_DEFAULTS.compact;
  
  // Merge: empty string or undefined = use default
  const mergedContent = Object.keys(defaults).reduce((acc, key) => {
    acc[key] = (content[key] !== undefined && content[key] !== '') 
      ? content[key] 
      : defaults[key];
    return acc;
  }, {});
  
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.compact;
  return <LayoutComponent content={mergedContent} vibe={vibe} theme={theme} />;
};

CalendarSection.descriptor = CALENDAR_DESCRIPTOR;
export default CalendarSection;
