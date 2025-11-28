import { format, addDays } from 'date-fns';

export const MOCK_SITE_IDENTIFIER = 'mock-site-001';

const today = new Date();

export const MOCK_CREATOR_CALENDAR = {
    events: [
        {
            id: 'event-1',
            date: format(today, 'yyyy-MM-dd'),
            start: '09:30',
            end: '10:45',
            title: 'Sesja oddechowa',
            meetingType: 'individual',
            status: 'Anna Kowalska',
            capacity: 1,
            booked: 1,
            color: '#A00016'
        },
        {
            id: 'event-2',
            date: format(addDays(today, 1), 'yyyy-MM-dd'),
            start: '18:00',
            end: '19:30',
            title: 'Wieczorna joga',
            meetingType: 'group',
            capacity: 15,
            booked: 4,
            color: '#770016'
        }
    ],
    availabilityBlocks: [
        {
            id: 'avail-1',
            date: format(today, 'yyyy-MM-dd'),
            start: '12:00',
            end: '15:00',
            durations: ['30m', '45m', '60m'],
            buffer: 15
        }
    ],
    externalEvents: [
        {
            id: 'ext-1',
            siteName: 'Mindful Studio',
            date: format(today, 'yyyy-MM-dd'),
            start: '16:00',
            end: '17:00',
            title: 'Warsztat zespołu',
            url: 'https://example.com/admin'
        }
    ],
    templates: [
        {
            id: 'weekday',
            name: 'Szablon tygodniowy',
            days: [format(today, 'yyyy-MM-dd')]
        }
    ]
};

export const MOCK_PUBLIC_CALENDAR = [
    {
        id: 'public-1',
        date: format(today, 'yyyy-MM-dd'),
        title: 'Sesja oddechowa 1:1'
    },
    {
        id: 'public-2',
        date: format(today, 'yyyy-MM-dd'),
        title: 'Zajęcia grupowe Yin Joga'
    },
    {
        id: 'public-3',
        date: format(addDays(today, 2), 'yyyy-MM-dd'),
        title: 'Warsztat Mindfulness'
    },
    {
        id: 'public-4',
        date: format(addDays(today, 4), 'yyyy-MM-dd'),
        title: 'Weekend regeneracyjny'
    }
];

export const MOCK_CALENDAR_PAYLOAD = {
    siteIdentifier: MOCK_SITE_IDENTIFIER,
    creator: MOCK_CREATOR_CALENDAR,
    public: {
        events: MOCK_PUBLIC_CALENDAR
    }
};
