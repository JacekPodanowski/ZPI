# Studio Dashboard - Complete Implementation Plan
## Phase 3: Advanced Calendar & Mode Switching

---

## 🚀 IMPLEMENTATION PROGRESS TRACKER

### ✅ Completed (Phase 1 - Week 1)
- [x] Created `dashboardStore.js` with Zustand state management
- [x] Implemented session management (1-hour timeout)
- [x] Created `dashboardAnimations.js` utility library
- [x] Built `SiteCard` component with animations
- [x] Built `SiteButton` component for collapsed view
- [x] Created `SiteSelector` with expand/collapse functionality
- [x] Built `EventDisplay` components (EventDot & EventBlock)
- [x] Created `CalendarGrid` with dot/block view switching
- [x] Built `NewStudioDashboard` main component
- [x] Added route `/studio/dashboard-new` for testing
- [x] Updated package.json with framer-motion ^12.23.12 and zustand ^5.0.6

### ✅ Completed (Phase 2 - Week 2-3)
- [x] Built `DayTemplate` component (compact & full view)
- [x] Built `WeekTemplate` component with mini calendar grid
- [x] Created `TemplateLibrary` component
- [x] Implemented template library width switching based on mode
- [x] Integrated TemplateLibrary into NewStudioDashboard
- [x] **Replaced old StudioDashboard with new implementation**
- [x] **Removed /studio/dashboard-new route**
- [x] **Deleted NewStudioDashboard.jsx duplicate file**
- [x] **Created backup: StudioDashboard.jsx.backup**

### 🔄 In Progress
- [ ] Day Detail Modal with Timeline
- [ ] Create Event Modal
- [ ] Drag-and-drop for templates

### 📋 Remaining Tasks (Weeks 4-8)
See detailed checklist below in "Implementation Checklist" section

---

## Executive Summary

This document outlines the complete transformation of the Studio Dashboard from a simple site management interface to an intelligent, context-aware workspace that seamlessly adapts between two modes:

1. **Site Management Focus** - Overview of all sites, high-level schedule visibility
2. **Calendar Power Mode** - Deep calendar operations, scheduling, template management

The system learns from user behavior, maintains session context, and provides a professional scheduling experience rivaling standalone calendar applications.

---

## Architecture Overview

### Component Hierarchy

```
StudioDashboard (NEW - replaces current)
├── DashboardStateProvider (Zustand store)
├── SiteSelector
│   ├── ExpandedView (240px height)
│   │   ├── SiteCard (with preview, status, stats)
│   │   └── NewSiteButton
│   └── CollapsedView (50px height)
│       ├── ChevronToggle
│       └── SiteButtonBar
├── CalendarContainer
│   ├── CalendarHeader (month nav, view controls)
│   ├── CalendarGrid
│   │   ├── DotView (Site Management mode)
│   │   └── BlockView (Calendar Power mode)
│   └── DayDetailModal
│       ├── Timeline
│       ├── EventBlocks
│       ├── AvailabilityBlocks
│       └── CreateEventModal
└── TemplateLibrary
    ├── CompactView (180px width)
    └── FullView (240px width)
        ├── DayTemplatesSection
        ├── WeekTemplatesSection
        └── DragDropManager
```

### State Management Structure

```javascript
// dashboardStore.js - NEW Zustand store
{
  // Mode Management
  mode: 'site-focus' | 'calendar-focus',
  collapsedByUser: boolean,
  
  // Site Selection
  selectedSiteId: string | null,
  sites: Array<Site>,
  
  // Calendar State
  currentMonth: Date,
  events: Array<Event>,
  availabilityBlocks: Array<AvailabilityBlock>,
  templates: {
    day: Array<DayTemplate>,
    week: Array<WeekTemplate>
  },
  
  // UI State
  calendarHeight: number,
  templateLibraryWidth: number,
  isTransitioning: boolean,
  
  // Session Management
  sessionStart: timestamp,
  lastInteraction: timestamp,
  
  // Actions
  switchMode: (mode, triggeredBy) => void,
  selectSite: (siteId) => void,
  updateLastInteraction: () => void,
  loadFromLocalStorage: () => void,
  saveToLocalStorage: () => void
}
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)

#### 1.1 Create Zustand Dashboard Store

**File:** `FRONTEND/src/STUDIO/store/dashboardStore.js`

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour

const useDashboardStore = create(
  persist(
    (set, get) => ({
      // Initial State
      mode: 'site-focus',
      collapsedByUser: false,
      selectedSiteId: null,
      sites: [],
      currentMonth: new Date(),
      events: [],
      availabilityBlocks: [],
      templates: { day: [], week: [] },
      calendarHeight: 650,
      templateLibraryWidth: 180,
      isTransitioning: false,
      sessionStart: Date.now(),
      lastInteraction: Date.now(),

      // Actions
      switchMode: (newMode, triggeredBy) => {
        const state = get();
        
        // Log mode switch for analytics
        console.log(`Mode switch: ${state.mode} → ${newMode} (triggered by: ${triggeredBy})`);
        
        set({
          mode: newMode,
          collapsedByUser: triggeredBy === 'manual',
          isTransitioning: true,
          calendarHeight: newMode === 'calendar-focus' ? 850 : 650,
          templateLibraryWidth: newMode === 'calendar-focus' ? 240 : 180,
          lastInteraction: Date.now()
        });
        
        // Reset transition flag after animation
        setTimeout(() => set({ isTransitioning: false }), 350);
      },

      selectSite: (siteId) => {
        set({
          selectedSiteId: get().selectedSiteId === siteId ? null : siteId,
          lastInteraction: Date.now()
        });
      },

      updateLastInteraction: () => {
        set({ lastInteraction: Date.now() });
      },

      isNewSession: () => {
        const { lastInteraction } = get();
        return Date.now() - lastInteraction > SESSION_TIMEOUT;
      },

      resetSession: () => {
        set({
          mode: 'site-focus',
          selectedSiteId: null,
          sessionStart: Date.now(),
          lastInteraction: Date.now(),
          collapsedByUser: false
        });
      }
    }),
    {
      name: 'studio-dashboard-state',
      partialize: (state) => ({
        mode: state.mode,
        selectedSiteId: state.selectedSiteId,
        lastInteraction: state.lastInteraction,
        sessionStart: state.sessionStart,
        collapsedByUser: state.collapsedByUser,
        currentMonth: state.currentMonth
      })
    }
  )
);

export default useDashboardStore;
```

#### 1.2 Create Animation Utilities

**File:** `FRONTEND/src/STUDIO/utils/dashboardAnimations.js`

```javascript
export const TRANSITION_DURATIONS = {
  COLLAPSE: 350,
  EXPAND: 300,
  SITE_CARD_FADE: 100,
  BUTTON_FADE: 170,
  CHEVRON_ROTATE: 200
};

export const EASING_CURVES = {
  STANDARD: 'cubic-bezier(0.4, 0, 0.2, 1)',
  BOUNCE: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out'
};

export const collapseAnimation = {
  initial: { height: 240, opacity: 1 },
  animate: { height: 50, opacity: 1 },
  transition: {
    duration: TRANSITION_DURATIONS.COLLAPSE / 1000,
    ease: EASING_CURVES.STANDARD
  }
};

export const expandAnimation = {
  initial: { height: 50, opacity: 1 },
  animate: { height: 240, opacity: 1 },
  transition: {
    duration: TRANSITION_DURATIONS.EXPAND / 1000,
    ease: EASING_CURVES.BOUNCE
  }
};

export const siteCardStaggerFade = (index, fadeOut = false) => ({
  initial: { opacity: fadeOut ? 1 : 0, scale: fadeOut ? 1 : 0.97 },
  animate: { opacity: fadeOut ? 0 : 1, scale: fadeOut ? 0.97 : 1 },
  transition: {
    delay: index * 0.1,
    duration: TRANSITION_DURATIONS.SITE_CARD_FADE / 1000,
    ease: EASING_CURVES.EASE_OUT
  }
});
```

---

### Phase 2: Site Selector Component (Week 1-2)

#### 2.1 Create SiteCard Component

**File:** `FRONTEND/src/STUDIO/components/Dashboard/SiteCard.jsx`

```javascript
import React from 'react';
import { Card, CardActionArea, CardContent, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useDashboardStore from '../../store/dashboardStore';

const SiteCard = ({ site, index, isSelected }) => {
  const navigate = useNavigate();
  const selectSite = useDashboardStore((state) => state.selectSite);
  
  const config = site?.template_config || {};
  const heroModule = config?.pages?.home?.modules?.find(m => 
    m.type?.toLowerCase() === 'hero'
  );
  
  const backgroundColor = heroModule?.config?.bgColor || 'rgba(228, 229, 218, 0.8)';
  const textColor = heroModule?.config?.textColor || 'rgb(30, 30, 30)';
  const siteColor = site.color_tag || 'rgb(146, 0, 32)';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: isSelected 
            ? `2px solid ${siteColor}`
            : '1px solid rgba(160, 0, 22, 0.14)',
          overflow: 'hidden',
          transform: isSelected ? 'translateY(-2px)' : 'none',
          boxShadow: isSelected
            ? `0 0 24px ${siteColor}40, 0 4px 16px rgba(0,0,0,0.2)`
            : 'none',
          transition: 'all 200ms ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        }}
      >
        <CardActionArea onClick={() => selectSite(site.id)}>
          {/* Color Header Bar */}
          <Box
            sx={{
              height: 35,
              backgroundColor: siteColor,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: 1
            }}
          >
            {/* Status Indicator */}
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: site.is_active ? '#4ade80' : '#ef4444',
                boxShadow: site.is_active 
                  ? '0 0 8px #4ade80'
                  : '0 0 8px #ef4444'
              }}
            />
          </Box>
          
          {/* Preview Image */}
          <Box
            sx={{
              height: 110,
              backgroundColor,
              backgroundImage: site.preview_image ? `url(${site.preview_image})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Site Info */}
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              {site.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: site.is_active ? '#4ade80' : '#ef4444',
                fontWeight: 'bold',
                fontSize: '12px',
                mb: 1
              }}
            >
              {site.is_active ? '🟢 AKTYWNA' : '🔴 WYŁĄCZONA'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '11px' }}>
              📊 {site.event_count || 0} events this week
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </motion.div>
  );
};

export default SiteCard;
```

#### 2.2 Create SiteSelector Component

**File:** `FRONTEND/src/STUDIO/components/Dashboard/SiteSelector.jsx`

```javascript
import React from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useDashboardStore from '../../store/dashboardStore';
import SiteCard from './SiteCard';
import SiteButton from './SiteButton';

const SiteSelector = ({ sites }) => {
  const navigate = useNavigate();
  const { mode, selectedSiteId, switchMode } = useDashboardStore();
  
  const isExpanded = mode === 'site-focus';
  
  const handleToggle = () => {
    switchMode(isExpanded ? 'calendar-focus' : 'site-focus', 'manual');
  };
  
  if (isExpanded) {
    return (
      <motion.div
        initial={{ height: 240 }}
        animate={{ height: 240 }}
        exit={{ height: 50 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        style={{ overflow: 'hidden', width: '100%' }}
      >
        <Box sx={{ height: 240, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={handleToggle} size="small">
                <ExpandMore />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                SITES
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate('/studio/new')}
            >
              + New Site
            </Button>
          </Box>
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 3,
              overflow: 'auto',
              maxHeight: 160
            }}
          >
            <AnimatePresence>
              {sites.map((site, index) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  index={index}
                  isSelected={selectedSiteId === site.id}
                />
              ))}
            </AnimatePresence>
          </Box>
        </Box>
      </motion.div>
    );
  }
  
  // Collapsed view
  return (
    <motion.div
      initial={{ height: 50 }}
      animate={{ height: 50 }}
      transition={{ duration: 0.3 }}
      style={{
        width: '100%',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        backgroundColor: 'background.paper'
      }}
    >
      <Box
        sx={{
          height: 50,
          display: 'flex',
          alignItems: 'center',
          px: 2,
          gap: 2
        }}
      >
        <Box
          onClick={handleToggle}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            '&:hover': { opacity: 0.7 }
          }}
        >
          <ExpandLess sx={{ fontSize: 16 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
            SITES
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
          {sites.map((site) => (
            <SiteButton
              key={site.id}
              site={site}
              isSelected={selectedSiteId === site.id}
            />
          ))}
        </Box>
        
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          October 2025
        </Typography>
      </Box>
    </motion.div>
  );
};

export default SiteSelector;
```

---

### Phase 3: Calendar Component Refactor (Week 2-3)

#### 3.1 Event Display Modes

**File:** `FRONTEND/src/STUDIO/components/Dashboard/Calendar/EventDisplay.jsx`

```javascript
import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import useDashboardStore from '../../../store/dashboardStore';

// Dot view for Site Management mode
export const EventDot = ({ event, siteColor }) => (
  <Tooltip title={`${event.title} - ${event.start_time}`}>
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: siteColor,
        cursor: 'pointer',
        '&:hover': {
          transform: 'scale(1.3)',
          transition: 'transform 150ms'
        }
      }}
    />
  </Tooltip>
);

// Block view for Calendar Power mode
export const EventBlock = ({ event, isSelectedSite, siteColor }) => {
  const bgColor = isSelectedSite
    ? `${siteColor}D9` // 85% opacity
    : 'rgba(188, 186, 179, 0.6)';
    
  const borderColor = isSelectedSite
    ? siteColor
    : 'rgb(188, 186, 179)';
  
  return (
    <Box
      sx={{
        minHeight: 32,
        maxHeight: 50,
        p: 0.75,
        borderRadius: 1,
        borderLeft: `3px solid ${borderColor}`,
        backgroundColor: bgColor,
        cursor: 'pointer',
        transition: 'all 150ms',
        '&:hover': {
          transform: 'scale(1.03) translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 20
        }
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: isSelectedSite ? 500 : 400, display: 'block', fontSize: '12px' }}>
        {event.start_time} {event.title}
      </Typography>
      {event.type === 'group' && (
        <Typography variant="caption" sx={{ fontSize: '11px', color: 'text.secondary' }}>
          [{event.current_capacity}/{event.max_capacity}]
        </Typography>
      )}
    </Box>
  );
};
```

#### 3.2 Calendar Grid Component

**File:** `FRONTEND/src/STUDIO/components/Dashboard/Calendar/CalendarGrid.jsx`

```javascript
import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import moment from 'moment';
import useDashboardStore from '../../../store/dashboardStore';
import { EventDot, EventBlock } from './EventDisplay';

const CalendarGrid = ({ events, onDayClick }) => {
  const { mode, selectedSiteId, currentMonth, switchMode } = useDashboardStore();
  
  const handleDayClick = (date) => {
    // Auto-switch to Calendar Power mode when clicking a day
    if (mode === 'site-focus') {
      switchMode('calendar-focus', 'day-click');
    }
    onDayClick(date);
  };
  
  const calendarDays = useMemo(() => {
    const startOfMonth = moment(currentMonth).startOf('month');
    const endOfMonth = moment(currentMonth).endOf('month');
    const startDate = startOfMonth.clone().startOf('week');
    const endDate = endOfMonth.clone().endOf('week');
    
    const days = [];
    let day = startDate.clone();
    
    while (day.isBefore(endDate)) {
      days.push(day.clone());
      day.add(1, 'day');
    }
    
    return days;
  }, [currentMonth]);
  
  const eventsByDate = useMemo(() => {
    const map = new Map();
    events.forEach(event => {
      const dateKey = moment(event.date).format('YYYY-MM-DD');
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey).push(event);
    });
    return map;
  }, [events]);
  
  const isPowerMode = mode === 'calendar-focus';
  
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 1,
        height: isPowerMode ? 850 : 650,
        transition: 'height 350ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Day headers */}
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
        <Box key={day} sx={{ textAlign: 'center', fontWeight: 600, pb: 1 }}>
          {day}
        </Box>
      ))}
      
      {/* Calendar cells */}
      {calendarDays.map(day => {
        const dateKey = day.format('YYYY-MM-DD');
        const dayEvents = eventsByDate.get(dateKey) || [];
        const isCurrentMonth = day.month() === moment(currentMonth).month();
        
        return (
          <Box
            key={dateKey}
            onClick={() => handleDayClick(day.toDate())}
            sx={{
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 2,
              p: 1,
              minHeight: isPowerMode ? 120 : 80,
              backgroundColor: isCurrentMonth ? 'background.paper' : 'action.hover',
              cursor: 'pointer',
              transition: 'all 200ms',
              '&:hover': {
                backgroundColor: 'rgba(146, 0, 32, 0.03)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              {day.date()}
            </Typography>
            
            {isPowerMode ? (
              // Block view
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {dayEvents.slice(0, 3).map(event => (
                  <EventBlock
                    key={event.id}
                    event={event}
                    isSelectedSite={event.site_id === selectedSiteId}
                    siteColor={event.site_color}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary' }}>
                    +{dayEvents.length - 3} more
                  </Typography>
                )}
              </Box>
            ) : (
              // Dot view
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {dayEvents.slice(0, 4).map(event => (
                  <EventDot key={event.id} event={event} siteColor={event.site_color} />
                ))}
                {dayEvents.length > 4 && (
                  <Typography variant="caption" sx={{ fontSize: '10px' }}>
                    +{dayEvents.length - 4}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default CalendarGrid;
```

---

### Phase 4: Template Library (Week 3-4)

#### 4.1 Template Components

**File:** `FRONTEND/src/STUDIO/components/Dashboard/Templates/TemplateLibrary.jsx`

```javascript
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import useDashboardStore from '../../../store/dashboardStore';
import DayTemplate from './DayTemplate';
import WeekTemplate from './WeekTemplate';

const TemplateLibrary = () => {
  const { mode, templates } = useDashboardStore();
  
  const width = mode === 'calendar-focus' ? 240 : 180;
  
  return (
    <motion.div
      animate={{ width }}
      transition={{ duration: 0.3 }}
      style={{
        height: '100%',
        borderRight: '1px solid rgba(0,0,0,0.1)',
        overflow: 'auto'
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontSize: mode === 'calendar-focus' ? 16 : 14 }}>
          TEMPLATES
        </Typography>
        
        {/* Day Templates Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 14 }}>
            DAY TEMPLATES
          </Typography>
          
          {templates.day.map(template => (
            <DayTemplate key={template.id} template={template} compact={mode === 'site-focus'} />
          ))}
          
          <Button fullWidth size="small" sx={{ mt: 1 }}>
            + New
          </Button>
        </Box>
        
        {/* Week Templates Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 14 }}>
            WEEK TEMPLATES
          </Typography>
          
          {templates.week.map(template => (
            <WeekTemplate key={template.id} template={template} compact={mode === 'site-focus'} />
          ))}
          
          <Button fullWidth size="small" sx={{ mt: 1 }}>
            + New
          </Button>
        </Box>
      </Box>
    </motion.div>
  );
};

export default TemplateLibrary;
```

---

### Phase 5: Day Detail Modal (Week 4-5)

**File:** `FRONTEND/src/STUDIO/components/Dashboard/DayDetail/DayDetailModal.jsx`

```javascript
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button
} from '@mui/material';
import { Close, Add, ChevronLeft, ChevronRight } from '@mui/icons-material';
import moment from 'moment';
import Timeline from './Timeline';
import CreateEventModal from './CreateEventModal';

const DayDetailModal = ({ open, date, events, onClose }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(date);
  
  const formattedDate = moment(currentDate).format('dddd, D MMMM YYYY');
  
  const handlePrevDay = () => {
    setCurrentDate(moment(currentDate).subtract(1, 'day').toDate());
  };
  
  const handleNextDay = () => {
    setCurrentDate(moment(currentDate).add(1, 'day').toDate());
  };
  
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            maxHeight: 900
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formattedDate}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" onClick={handlePrevDay}>
                <ChevronLeft />
              </IconButton>
              <Button size="small" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <IconButton size="small" onClick={handleNextDay}>
                <ChevronRight />
              </IconButton>
              <IconButton size="small" onClick={() => setShowCreateModal(true)}>
                <Add />
              </IconButton>
              <IconButton size="small" onClick={onClose}>
                <Close />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Timeline date={currentDate} events={events} />
        </DialogContent>
      </Dialog>
      
      <CreateEventModal
        open={showCreateModal}
        date={currentDate}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
};

export default DayDetailModal;
```

---

## Implementation Checklist

### Week 1
- [ ] Create dashboardStore.js with Zustand
- [ ] Implement session management logic
- [ ] Create animation utilities
- [ ] Build SiteCard component
- [ ] Build SiteButton component
- [ ] Create SiteSelector with expand/collapse

### Week 2
- [ ] Refactor CalendarGrid component
- [ ] Implement EventDot and EventBlock views
- [ ] Add mode-based rendering logic
- [ ] Implement auto-switch triggers
- [ ] Add calendar navigation

### Week 3
- [ ] Build TemplateLibrary component
- [ ] Create DayTemplate component
- [ ] Create WeekTemplate component
- [ ] Implement compact/full view switching
- [ ] Add template creation flow

### Week 4
- [ ] Build DayDetailModal
- [ ] Create Timeline component
- [ ] Implement event rendering on timeline
- [ ] Add availability blocks display
- [ ] Create quick navigation (prev/next day)

### Week 5
- [ ] Build CreateEventModal
- [ ] Implement event form validation
- [ ] Add availability block creation
- [ ] Implement conflict detection
- [ ] Add success/error feedback

### Week 6
- [ ] Implement drag-and-drop for templates
- [ ] Add template application logic
- [ ] Create confirmation modals
- [ ] Add mobile responsive layouts
- [ ] Implement touch interactions

### Week 7
- [ ] Integration testing
- [ ] Performance optimization
- [ ] Animation polish
- [ ] LocalStorage persistence testing
- [ ] Cross-browser testing

### Week 8
- [ ] Bug fixes
- [ ] Documentation
- [ ] User testing
- [ ] Final refinements

---

## Technical Considerations

### Performance Optimization

1. **Memoization**
   - Use `useMemo` for expensive calendar calculations
   - Memoize event grouping by date
   - Cache template lists

2. **Virtual Scrolling**
   - Implement for long event lists in timeline
   - Use for template library if many templates

3. **Animation Performance**
   - Use `transform` and `opacity` for animations
   - Avoid animating `width`/`height` when possible
   - Use `will-change` CSS property sparingly

### Accessibility

1. **Keyboard Navigation**
   - Arrow keys to navigate calendar
   - Tab order through interactive elements
   - Enter/Space to activate buttons

2. **Screen Readers**
   - Proper ARIA labels
   - Announce mode switches
   - Describe calendar state

3. **Focus Management**
   - Trap focus in modals
   - Return focus after modal close
   - Visible focus indicators

### Browser Compatibility

- Test in Chrome, Firefox, Safari, Edge
- Ensure Framer Motion works across browsers
- Fallback animations for older browsers
- localStorage availability check

---

## Future Enhancements (Post-Phase 3)

1. **Advanced Template Features**
   - Template categories/tags
   - Template sharing between sites
   - Template marketplace

2. **Calendar Integrations**
   - Google Calendar sync
   - Outlook integration
   - iCal export

3. **Analytics Dashboard**
   - Booking trends
   - Popular time slots
   - Revenue tracking

4. **Collaborative Features**
   - Share calendar with team
   - Multi-user editing
   - Activity log

---

## Conclusion

This implementation plan transforms the Studio Dashboard into a professional-grade scheduling platform while maintaining simplicity and elegance. The intelligent mode switching creates a seamless user experience that adapts to user intent, making complex calendar management feel effortless.

The phased approach ensures steady progress with testable milestones at each stage. Each component is designed to be maintainable, extensible, and follows the established architecture principles.

**Next Steps:**
1. Review and approve this plan
2. Set up project timeline
3. Begin Phase 1 implementation
4. Schedule weekly progress reviews
