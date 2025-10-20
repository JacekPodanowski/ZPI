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
                console.log('(DEBUGLOG) dashboardStore.setSites', { count: sites?.length ?? 0 });
                set({ sites });
            },

            selectSite: (siteId) => {
                set((state) => {
                    const nextSelection = state.selectedSiteId === siteId ? null : siteId;
                    console.log('(DEBUGLOG) dashboardStore.selectSite', { siteId, nextSelection });
                    return { selectedSiteId: nextSelection };
                });
            },

            setCurrentMonth: (month) => {
                console.log('(DEBUGLOG) dashboardStore.setCurrentMonth', {
                    month: month instanceof Date ? month.toISOString() : month
                });
                set({ currentMonth: month });
            },

            setEvents: (events) => {
                console.log('(DEBUGLOG) dashboardStore.setEvents', { count: events?.length ?? 0 });
                set({ events });
            },

            setAvailabilityBlocks: (blocks) => {
                console.log('(DEBUGLOG) dashboardStore.setAvailabilityBlocks', { count: blocks?.length ?? 0 });
                set({ availabilityBlocks: blocks });
            },

            setTemplates: (templates) => {
                console.log('(DEBUGLOG) dashboardStore.setTemplates', {
                    day: templates?.day?.length ?? 0,
                    week: templates?.week?.length ?? 0
                });
                set({ templates });
            },

            resetDashboardState: () => {
                console.log('(DEBUGLOG) dashboardStore.reset');
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
