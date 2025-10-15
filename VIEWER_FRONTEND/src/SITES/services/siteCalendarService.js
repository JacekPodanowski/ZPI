import apiClient from '../../services/apiClient';
import {
    MOCK_CALENDAR_PAYLOAD,
    MOCK_SITE_IDENTIFIER
} from '../data/mockSiteCalendar';

export const CALENDAR_DATA_SOURCES = {
    API: 'api',
    MOCK: 'mock',
    UNKNOWN: 'unknown'
};

const buildInitialCreatorState = () => ({
    events: [],
    availabilityBlocks: [],
    externalEvents: [],
    templates: []
});

const buildInitialPublicState = () => ({
    events: []
});

export const fetchSiteCalendar = async (siteIdentifier = MOCK_SITE_IDENTIFIER) => {
    try {
        const response = await apiClient.get(`/sites/${siteIdentifier}/calendar/`);
        if (response?.data) {
            return {
                ...response.data,
                siteIdentifier: response.data.siteIdentifier ?? siteIdentifier,
                dataSource: CALENDAR_DATA_SOURCES.API
            };
        }
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.warn('[calendar] Falling back to mock data for site', siteIdentifier, error);
        }
    }

    return {
        ...MOCK_CALENDAR_PAYLOAD,
        siteIdentifier: siteIdentifier ?? MOCK_SITE_IDENTIFIER,
        dataSource: CALENDAR_DATA_SOURCES.MOCK
    };
};

export const getInitialCalendarState = () => ({
    siteIdentifier: MOCK_SITE_IDENTIFIER,
    dataSource: CALENDAR_DATA_SOURCES.UNKNOWN,
    creator: buildInitialCreatorState(),
    public: buildInitialPublicState()
});

export const toEventsByDateMap = (events) => {
    const map = new Map();
    events.forEach((event) => {
        const dateKey = event.date;
        if (!map.has(dateKey)) {
            map.set(dateKey, []);
        }
        map.get(dateKey).push(event);
    });
    return map;
};
