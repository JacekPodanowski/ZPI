# Calendar Quick Notes

1. CalendarGridControlled renders the visual calendar and expects all state via props (events, sites, mode, selectedSiteId, currentMonth).
2. CalendarGridContainer wires CalendarGridControlled to the dashboard Zustand store and auto-switches to calendar-focus when a day is clicked.
3. Default import from CalendarGrid.jsx returns the container variant so legacy imports keep working.
4. Events must include id, date (YYYY-MM-DD), title, and optional site_id/site_color for styling chips.
5. Sites should supply id, name, and color_tag so the chip renderer can tint UI elements.
6. Pass mode="calendar-focus" for block layout or mode="site-focus" for compact dots.
7. currentMonth should be a native Date object; CalendarGridControlled converts it to moment internally.
8. onMonthChange receives a Date representing the first day of the new month; persist it upstream as needed.
9. onDayClick receives the clicked day as a Date; open DayDetailsModal from there.
10. Availability blocks live outside the grid and are injected into DayDetailsModal for timeline rendering.
11. RealTemplateBrowser handles template UI; wire template actions into the same state domain to keep interactions synced.
12. Update dashboardStore when integrating new features so CalendarGridContainer can propagate mode/site changes correctly.
13. Keep per-day hover behavior lightweight; EventBlock shrinks siblings when hovered to preserve Ethereal Minimalism.
14. CalendarGridControlled dims days without the selected site unless selectedSiteId is null.
15. Respect the color palette; fallback colors stay within rgb(146, 0, 32) family.
16. For drag/drop templates, use container state to stage UI overlays; avoid embedding DnD logic inside CalendarGridControlled.
17. When toggling sites, return null to clear selection and show all events.
18. Run UI animations through framer-motion; timeline durations stay under 200ms to keep flow smooth.
19. Keep new props additive; CalendarGridControlled should remain unaware of global stores.
20. If you add features, update this file so future agents know where context lives.
