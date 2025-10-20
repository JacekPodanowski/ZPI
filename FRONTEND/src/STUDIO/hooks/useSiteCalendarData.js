import { useCallback, useEffect, useState } from 'react';
import { fetchSiteCalendar, getInitialCalendarState } from '../services/siteCalendarService';
import { MOCK_SITE_IDENTIFIER } from '../data/mockSiteCalendar';

const useSiteCalendarData = (siteIdentifier = MOCK_SITE_IDENTIFIER) => {
    const [state, setState] = useState(() => getInitialCalendarState());
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);

    const applyPayload = useCallback((payload) => {
        console.log('(DEBUGLOG) useSiteCalendarData.applyPayload', {
            siteIdentifier: payload?.siteIdentifier ?? siteIdentifier,
            dataSource: payload?.dataSource,
            creatorEvents: payload?.creator?.events?.length ?? 0,
            availabilityBlocks: payload?.creator?.availabilityBlocks?.length ?? 0
        });
        setState((prev) => ({
            siteIdentifier: payload.siteIdentifier ?? siteIdentifier,
            dataSource: payload.dataSource ?? prev.dataSource,
            creator: payload.creator ?? prev.creator,
            public: payload.public ?? prev.public
        }));
    }, [siteIdentifier]);

    const load = useCallback(async () => {
        console.log('(DEBUGLOG) useSiteCalendarData.load:start', { siteIdentifier });
        setStatus('loading');
        setError(null);
        try {
            const payload = await fetchSiteCalendar(siteIdentifier);
            applyPayload(payload);
            setStatus('success');
            console.log('(DEBUGLOG) useSiteCalendarData.load:success', {
                siteIdentifier: payload?.siteIdentifier ?? siteIdentifier,
                dataSource: payload?.dataSource
            });
        } catch (err) {
            setError(err);
            setStatus('error');
            console.error('(DEBUGLOG) useSiteCalendarData.load:error', err);
        }
    }, [applyPayload, siteIdentifier]);

    useEffect(() => {
        let isMounted = true;
        (async () => {
            console.log('(DEBUGLOG) useSiteCalendarData.effect:start', { siteIdentifier });
            setStatus('loading');
            setError(null);
            try {
                const payload = await fetchSiteCalendar(siteIdentifier);
                if (!isMounted) return;
                applyPayload(payload);
                setStatus('success');
                console.log('(DEBUGLOG) useSiteCalendarData.effect:success', {
                    siteIdentifier: payload?.siteIdentifier ?? siteIdentifier,
                    dataSource: payload?.dataSource
                });
            } catch (err) {
                if (!isMounted) return;
                setError(err);
                setStatus('error');
                console.error('(DEBUGLOG) useSiteCalendarData.effect:error', err);
            }
        })();
        return () => {
            isMounted = false;
            console.log('(DEBUGLOG) useSiteCalendarData.effect:cleanup', { siteIdentifier });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applyPayload, siteIdentifier]);

    return {
        ...state,
        status,
        error,
        refresh: load
    };
};

export default useSiteCalendarData;
