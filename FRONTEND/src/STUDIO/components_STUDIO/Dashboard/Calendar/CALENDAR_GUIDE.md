# Calendar Quick Guide for AI Agents

## Architecture
1. **CalendarGridControlled** is the main calendar component - renders the grid and expects all state via props (events, sites, selectedSiteId, currentMonth).
2. The calendar operates in a single full-featured mode (110px tiles, full event blocks) - legacy dual-mode system has been removed.

## Color System
3. Sites use **color_index** (0-11) mapped to colors via `getSiteColorHex()` from `theme/siteColors.js`.
4. Backend auto-assigns colors sequentially: 1st site = Red (0), 2nd = Blue (1), 3rd = Green (2), etc.
5. Events inherit site colors via `site_color` prop and **always** display in their site color. Site filtering affects opacity (0.6) and grayscale (40%) but preserves color identity.

## Layout & Display
6. Day names header is separate from grid to prevent gaps; calendar uses `gridAutoRows: 'minmax(110px, 1fr)'` with responsive gaps (0.5/0.75) and padding (0.5/1).
7. Site filter buttons always display with `borderRadius: 3` and site-specific colors.
8. Events use smart scaling: Normal (≤3 events), Compact (4-5), Minimal (6-7), Collapsed (≥8). Events are sized to fit within available space (~90px after day number): Normal=26px, Compact=18px, Minimal=14px. Hover expansion can overflow tile boundaries.

## Event Display & Interactions
9. EventBlock components show full event details with 400ms smooth animations using cubic-bezier easing.
10. Hovering an event blocks day tile hover to prevent double-highlighting.
11. Hovered events expand with scale + translateY (can overflow tile), siblings shrink to 0.92 scale and 0.7 opacity to maintain visibility within tile.

## Day Tile Behavior
12. Day hover effect is unified - both tile background and day number change together when hovering empty areas.
13. Past days with no events are non-clickable (`cursor: 'default'`) to prevent confusion.
14. Today has red glow (`boxShadow`), 2px border, and text-shadow for prominence.
15. Day number grows from center on hover (15px → 16px) using `transformOrigin: 'center center'`. Day number has `mb: 0.25` (reduced padding) to maximize event space.

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

## Template Components
26. **DayTemplate**: Events styled like calendar EventBlocks with borderLeft accent. Uses site colors from `event.site_color` (priority), `event.site.color_index`, or defaults to red. Shows up to 3 events before "+X więcej" message. Supports drag and drop with `draggable` attribute.
27. **WeekTemplate**: Event count displayed as "X Events" in red badge at top-right corner. Mini calendar grid shows active days with site-themed styling. Supports drag and drop with `draggable` attribute.

## Template Browser UI
28. Sections are collapsible with chevron icons (▶ collapsed, ▼ expanded). Click section title or icon to toggle.
29. **Add Button**: "+" icon button appears on right side of section header when templates exist. When no templates, centered "+" button shows below "Brak szablonów" message.
30. **Trash Zone**: Appears at bottom of browser (height: 80px) only when dragging a template. Red dashed border with delete icon. Drop template to trigger deletion (with confirmation).

## Drag and Drop
31. Templates are draggable using HTML5 drag API. When dragged, templates scale down (0.9) and reduce opacity (0.5).
32. Calendar day tiles accept drops via `onDragOver`, `onDragLeave`, `onDrop` handlers. Drop targets show dashed red border with pulse animation.
33. Drag data includes: `templateType` (day/week), `templateId`, and `templateData` (JSON serialized template object).

DESCRIBE YOUR CHANGES IN THIS GUIDE