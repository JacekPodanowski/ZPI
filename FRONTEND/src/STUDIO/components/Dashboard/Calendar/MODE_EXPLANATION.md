# Calendar Mode System Explanation

## Overview
The calendar component supports two display modes through the `mode` prop, though currently **only one mode is actively used** in production.

## Mode Types

### 1. `'calendar-focus'` (Currently Used)
**Status:** ✅ **ACTIVE** - This is the mode currently used in `CreatorCalendarApp.jsx`

**What it does:**
- **Larger Day Tiles:** Grid rows are `110px` tall (vs 58px in site-focus)
- **Full Event Display:** Shows EventBlock components with smart scaling (normal/compact/minimal/collapsed views)
- **Day Name Size:** Uses `16px` font size for day names
- **Day Number Size:** Uses `15px` font size for day numbers
- **Spacing:** More generous padding (`0.85` or `0.75` for today) and margins (`0.5` bottom margin)
- **Visual Focus:** Optimized for detailed event viewing and calendar management

**Code Pattern:**
```javascript
const isPowerMode = mode === 'calendar-focus';
// isPowerMode = true
```

### 2. `'site-focus'` (Legacy/Unused)
**Status:** ⚠️ **DEPRECATED** - Not currently used in any active page

**What it does:**
- **Compact Day Tiles:** Grid rows are only `58px` tall
- **Dot Display:** Shows EventDot components (small colored dots) instead of full event blocks
- **Day Name Size:** Uses `15px` font size for day names
- **Day Number Size:** Uses `12.5px` font size for day numbers
- **Spacing:** Minimal padding (`0.65`) and margins (`0.35` bottom margin)
- **Visual Focus:** Optimized for overview/glance viewing

**Code Pattern:**
```javascript
const isPowerMode = mode === 'calendar-focus';
// isPowerMode = false
```

## Current Usage

### Active Implementation
```jsx
// FRONTEND/src/STUDIO/pages/Creator/CreatorCalendarApp.jsx
<CalendarGridControlled
    mode="calendar-focus"  // ← Always set to 'calendar-focus'
    // ... other props
/>
```

### Where `isPowerMode` Affects the UI

1. **Day Names Header**
   ```javascript
   fontSize: isPowerMode ? '16px' : '15px'
   ```

2. **Calendar Grid Height**
   ```javascript
   gridAutoRows: isPowerMode ? 'minmax(110px, 1fr)' : 'minmax(58px, 1fr)'
   ```

3. **Day Tile Padding**
   ```javascript
   p: isPowerMode ? (isToday ? 0.75 : 0.85) : 0.65
   ```

4. **Day Number**
   ```javascript
   mb: isPowerMode ? 0.5 : 0.35
   fontSize: isPowerMode ? '15px' : '12.5px'
   ```

5. **Event Display Mode**
   ```javascript
   {isPowerMode ? (
       // Show full EventBlock components with smart scaling
       <EventBlock ... />
   ) : (
       // Show compact EventDot components
       <EventDot ... />
   )}
   ```

## Historical Context

This dual-mode system was likely designed for an older Studio dashboard where:
- **Site-focus mode** would show a compact calendar alongside site management
- **Calendar-focus mode** would expand the calendar for detailed event management

The old dashboard architecture appears to have been replaced with the current `CreatorCalendarApp.jsx`, which uses only the calendar-focus mode.

## Recommendation

Since only `'calendar-focus'` mode is used:

### Option 1: Keep as-is (Current State)
- **Pros:** Preserves flexibility if we want to add compact view later
- **Cons:** Extra conditional logic that's never executed

### Option 2: Simplify (Future Refactor)
- Remove the `mode` prop entirely
- Remove all `isPowerMode` conditionals
- Hard-code all values to the 'calendar-focus' settings
- **Pros:** Cleaner, simpler code
- **Cons:** Loss of flexibility; would need to re-implement if compact mode needed

## Conclusion

**Current Status:** `isPowerMode` is a legacy feature that controls calendar display density. While the code supports two modes, only `'calendar-focus'` (isPowerMode = true) is actively used in production. The system works correctly but contains unused code paths that could be simplified in a future refactor.
