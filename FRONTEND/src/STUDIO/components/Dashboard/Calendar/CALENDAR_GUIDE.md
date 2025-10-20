# Calendar Quick Notes

## Core Architecture
1. **CalendarGridControlled** renders the visual calendar and expects all state via props (events, sites, mode, selectedSiteId, currentMonth).
2. **CalendarGridContainer** wires CalendarGridControlled to the dashboard Zustand store and auto-switches to calendar-focus when a day is clicked.
3. Default import from CalendarGrid.jsx returns the container variant so legacy imports keep working.

## Color System (Updated)
4. Sites use **color_index** (0-11) stored in the backend, mapped to colors via `getSiteColorHex()` from `theme/siteColors.js`.
5. Auto-assignment: 1st site = color 0 (Red), 2nd site = color 1 (Blue), 3rd = color 2 (Green), etc.
6. **Site buttons** display in their assigned color using `getSiteColorHex(site.color_index ?? 0)`.
7. **Events** inherit their site's color via `site_color` prop, calculated the same way.
8. Color consistency across calendar buttons, events, and SitesPage tiles is guaranteed by the centralized SITE_COLOR_PALETTE.

## Layout & Spacing (Updated)
9. Day names header is **separate from grid** to prevent large row gaps.
10. Calendar grid uses `gridAutoRows: 'minmax(110px, 1fr)'` and `overflow: 'hidden'` to prevent scrolling.
11. Padding optimized for scroll-free viewing: header `pt: 0.75, pb: 1`, grid `px: 1, pb: 1`.
12. Site buttons have `borderRadius: 3` for modern rounded appearance.

## Data Flow
13. Events must include id, date (YYYY-MM-DD), title, and optional site_id/site_color for styling.
14. Sites must supply id, name, and color_index so the chip renderer can apply correct colors.
15. Pass mode="calendar-focus" for block layout or mode="site-focus" for compact dots.
16. currentMonth is a native Date object; CalendarGridControlled converts it to moment internally.

## Interactions
17. onMonthChange receives a Date for the first day of the new month; persist it upstream.
18. onDayClick receives the clicked day as a Date; open DayDetailsModal from there.
19. When toggling site buttons, return null to clear selection and show all events.
20. CalendarGridControlled dims days without the selected site unless selectedSiteId is null.
21. EventBlock shrinks siblings when hovered to preserve Ethereal Minimalism (200ms animations).

## Integration Points
22. Availability blocks live outside the grid and are injected into DayDetailsModal for timeline rendering.
23. RealTemplateBrowser handles template UI; wire template actions into the same state domain.
24. For drag/drop templates, use container state to stage UI overlays; avoid embedding DnD logic inside CalendarGridControlled.
25. Keep new props additive; CalendarGridControlled should remain unaware of global stores.
26. Update dashboardStore when integrating new features so CalendarGridContainer can propagate mode/site changes correctly.

