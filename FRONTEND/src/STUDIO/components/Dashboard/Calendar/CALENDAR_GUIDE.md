# Calendar Quick Guide for AI Agents

## Architecture
1. **CalendarGridControlled** is the main calendar component - renders the grid and expects all state via props (events, sites, selectedSiteId, currentMonth).
2. The calendar operates in a single full-featured mode (110px tiles, full event blocks) - legacy dual-mode system has been removed.

## Color System
3. Sites use **color_index** (0-11) mapped to colors via `getSiteColorHex()` from `theme/siteColors.js`.
4. Backend auto-assigns colors sequentially: 1st site = Red (0), 2nd = Blue (1), 3rd = Green (2), etc.
5. Events inherit site colors via `site_color` prop for consistency across the calendar.

## Layout & Display
6. Day names header is separate from grid to prevent gaps; calendar uses `gridAutoRows: 'minmax(110px, 1fr)'` with `overflow: 'hidden'`.
7. Site filter buttons always display with `borderRadius: 3` and site-specific colors.
8. Events use smart scaling: Normal (≤4 events), Compact (5-7), Minimal (8-10), Collapsed (>10).

## Event Display & Interactions
9. EventBlock components show full event details with 400ms smooth animations using cubic-bezier easing.
10. Hovering an event blocks day tile hover to prevent double-highlighting.
11. Hovered events lift up and siblings shrink (scale 0.88) for ethereal minimalism effect.

## Day Tile Behavior
12. Day hover effect is unified - both tile background and day number change together when hovering empty areas.
13. Past days with no events are non-clickable (`cursor: 'default'`) to prevent confusion.
14. Today has red glow (`boxShadow`), 2px border, and text-shadow for prominence.
15. Day number grows from center on hover (15px → 16px) using `transformOrigin: 'center center'`.

## Data Requirements
16. Events need: id, date (YYYY-MM-DD), title, optional site_id/site_color.
17. Sites need: id, name, color_index (0-11).
18. currentMonth is a native Date object; converted to moment internally.

## Event Handlers
19. onMonthChange receives Date for first day of new month.
20. onDayClick receives clicked day as Date; use for opening DayDetailsModal.
21. onSiteSelect toggles filtering - return null to clear and show all events.

## Hover & Pointer Events
22. For 0-1 events, container has `pointerEvents: 'none'` allowing day tile hover in empty areas.
23. Individual events always have `pointerEvents: 'auto'` for their own hover/click.
24. Event hover sets `hoveredEventId` which blocks day hover (`isDayHovered` checks this).

## State Management
25. Component uses local state for hover tracking (hoveredEventId, hoveredDayKey) - no global store dependencies.

DESCRIBE YOUR CHANGES IN THIS GUIDE