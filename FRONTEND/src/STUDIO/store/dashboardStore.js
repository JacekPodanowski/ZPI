import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds

const useDashboardStore = create(
    persist(
        (set, get) => ({
            // ========== Mode Management ==========
            mode: 'site-focus', // 'site-focus' | 'calendar-focus'
            collapsedByUser: false, // Did user manually toggle?
            isTransitioning: false,

            // ========== Site Selection ==========
            selectedSiteId: null,
            sites: [],

            // ========== Calendar State ==========
            currentMonth: new Date(),
            events: [],
            availabilityBlocks: [],
            templates: {
                day: [],
                week: []
            },

            // ========== UI Dimensions ==========
            calendarHeight: 520, // Site Management: 520px, Calendar Power: 850px
            templateLibraryWidth: 180, // Site Management: 180px, Calendar Power: 240px

            // ========== Session Management ==========
            sessionStart: Date.now(),
            lastInteraction: Date.now(),

            // ========== Actions ==========

            /**
             * Switch between Site Management Focus and Calendar Power modes
             * @param {string} newMode - 'site-focus' | 'calendar-focus'
             * @param {string} triggeredBy - What triggered the switch (e.g., 'manual', 'day-click', 'event-click')
             */
            switchMode: (newMode, triggeredBy = 'unknown') => {
                const state = get();

                // Don't switch if already in that mode
                if (state.mode === newMode) return;

                // Log for analytics/debugging
                console.log(`[Dashboard] Mode switch: ${state.mode} → ${newMode} (triggered by: ${triggeredBy})`);

                set({
                    mode: newMode,
                    collapsedByUser: triggeredBy === 'manual',
                    isTransitioning: true,
                    calendarHeight: newMode === 'calendar-focus' ? 850 : 520,
                    templateLibraryWidth: newMode === 'calendar-focus' ? 240 : 180,
                    lastInteraction: Date.now()
                });

                // Reset transition flag after animation completes
                setTimeout(() => {
                    set({ isTransitioning: false });
                }, 350); // Match TRANSITION_DURATIONS.COLLAPSE
            },

            /**
             * Select or deselect a site
             * @param {string} siteId - The site ID to select (or null to deselect)
             */
            selectSite: (siteId) => {
                const currentSelected = get().selectedSiteId;

                // Toggle: if clicking the same site, deselect it
                const newSelection = currentSelected === siteId ? null : siteId;

                set({
                    selectedSiteId: newSelection,
                    lastInteraction: Date.now()
                });

                console.log(`[Dashboard] Site ${newSelection ? 'selected' : 'deselected'}:`, siteId);
            },

            /**
             * Update sites list (fetched from API)
             * @param {Array} sites - Array of site objects
             */
            setSites: (sites) => {
                set({ sites });
            },

            /**
             * Update events list for the calendar
             * @param {Array} events - Array of event objects
             */
            setEvents: (events) => {
                set({ events });
            },

            /**
             * Update availability blocks
             * @param {Array} blocks - Array of availability block objects
             */
            setAvailabilityBlocks: (blocks) => {
                set({ availabilityBlocks: blocks });
            },

            /**
             * Update templates
             * @param {Object} templates - { day: [], week: [] }
             */
            setTemplates: (templates) => {
                set({ templates });
            },

            /**
             * Change the current month being viewed
             * @param {Date} month - The new month date
             */
            setCurrentMonth: (month) => {
                set({
                    currentMonth: month,
                    lastInteraction: Date.now()
                });
            },

            /**
             * Update last interaction timestamp (extends session)
             */
            updateLastInteraction: () => {
                set({ lastInteraction: Date.now() });
            },

            /**
             * Check if current session has expired
             * @returns {boolean} True if session is new/expired
             */
            isNewSession: () => {
                const { lastInteraction } = get();
                const timeSinceLastInteraction = Date.now() - lastInteraction;
                return timeSinceLastInteraction > SESSION_TIMEOUT;
            },

            /**
             * Reset to fresh session (called on new session detection)
             */
            resetSession: () => {
                console.log('[Dashboard] Session expired - resetting to Site Management mode');

                set({
                    mode: 'site-focus',
                    selectedSiteId: null,
                    currentMonth: new Date(),
                    sessionStart: Date.now(),
                    lastInteraction: Date.now(),
                    collapsedByUser: false,
                    calendarHeight: 650,
                    templateLibraryWidth: 180
                });
            },

            /**
             * Initialize store on mount (check for session expiry)
             */
            initialize: () => {
                const state = get();

                if (state.isNewSession()) {
                    state.resetSession();
                } else {
                    console.log('[Dashboard] Continuing previous session');
                    // Update interaction timestamp to extend session
                    set({ lastInteraction: Date.now() });
                }
            }
        }),
        {
            name: 'studio-dashboard-state',
            // Only persist specific fields
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
