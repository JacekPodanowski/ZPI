import { useCallback, useEffect, useState } from 'react';
import { fetchSiteCalendar, getInitialCalendarState } from '../services/siteCalendarService';
import { MOCK_SITE_IDENTIFIER } from '../data/mockSiteCalendar';

const useSiteCalendarData = (siteIdentifier = MOCK_SITE_IDENTIFIER) => {
    const [state, setState] = useState(() => getInitialCalendarState());
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);

    const applyPayload = useCallback((payload) => {
        setState((prev) => ({
            siteIdentifier: payload.siteIdentifier ?? siteIdentifier,
            dataSource: payload.dataSource ?? prev.dataSource,
            creator: payload.creator ?? prev.creator,
            public: payload.public ?? prev.public
        }));
    }, [siteIdentifier]);

    const load = useCallback(async () => {
        setStatus('loading');
        setError(null);
        try {
            const payload = await fetchSiteCalendar(siteIdentifier);
            applyPayload(payload);
            setStatus('success');
        } catch (err) {
            setError(err);
            setStatus('error');
        }
    }, [applyPayload, siteIdentifier]);

    useEffect(() => {
        let isMounted = true;
        (async () => {
            setStatus('loading');
            setError(null);
            try {
                const payload = await fetchSiteCalendar(siteIdentifier);
                if (!isMounted) return;
                applyPayload(payload);
                setStatus('success');
            } catch (err) {
                if (!isMounted) return;
                setError(err);
                setStatus('error');
            }
        })();
        return () => {
            isMounted = false;
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
