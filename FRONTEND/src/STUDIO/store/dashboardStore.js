import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const createEmptyTemplates = () => ({ day: [], week: [] });

const useDashboardStore = create(
    persist(
        (set) => ({
            sites: [],
            selectedSiteId: null,
            currentMonth: new Date(),
            events: [],
            availabilityBlocks: [],
            templates: createEmptyTemplates(),

            setSites: (sites) => {
                set({ sites });
            },

            selectSite: (siteId) => {
                set((state) => {
                    const nextSelection = state.selectedSiteId === siteId ? null : siteId;
                    return { selectedSiteId: nextSelection };
                });
            },

            setCurrentMonth: (month) => {
                set({ currentMonth: month });
            },

            setEvents: (events) => {
                set({ events });
            },

            setAvailabilityBlocks: (blocks) => {
                set({ availabilityBlocks: blocks });
            },

            setTemplates: (templates) => {
                set({ templates });
            },

            resetDashboardState: () => {
                set({
                    selectedSiteId: null,
                    events: [],
                    availabilityBlocks: [],
                    templates: createEmptyTemplates()
                });
            }
        }),
        {
            name: 'studio-dashboard-state',
            partialize: (state) => ({
                selectedSiteId: state.selectedSiteId,
                currentMonth: state.currentMonth
            })
        }
    )
);

export default useDashboardStore;
