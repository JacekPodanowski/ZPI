import React, { useEffect, useMemo, useState } from 'react';
import { EVENTS_DEFAULTS, EVENTS_DESCRIPTOR } from './descriptor';
import ListEvents from './layouts/ListEvents';
import GridEvents from './layouts/GridEvents';
import TimelineEvents from './layouts/TimelineEvents';
import { fetchPublicBigEvents, fetchBigEvents } from '../../../../services/bigEventService';

const LAYOUTS = {
  list: ListEvents,
  grid: GridEvents,
  timeline: TimelineEvents
};

const PREVIEW_IDENTIFIERS = new Set(['preview', 'undefined', undefined, null, '', 'null']);

const normalizeBigEvent = (event = {}) => {
  const details = event.details || {};
  const rawImages = event.gallery || details.images || [];
  const mergedImages = event.image_url && !rawImages.includes(event.image_url)
    ? [...rawImages, event.image_url]
    : rawImages;

  return {
    id: event.id,
    title: event.title,
    date: event.start_date,
    endDate: event.end_date,
    summary: event.summary || details.summary || event.description || '',
    location: event.location,
    tag: event.tag || details.tag || 'Wydarzenie',
    fullDescription: event.full_description || details.full_description || event.description || '',
    images: mergedImages,
    ctaLabel: event.cta_label || details.cta_label || null,
    ctaUrl: event.cta_url || details.cta_url || null,
    price: event.price
  };
};

const EventsSection = ({ layout = 'list', content = {}, style, siteIdentifier, siteId, isEditing = false, moduleId, pageId }) => {
  const defaultOptions = EVENTS_DEFAULTS[layout] || EVENTS_DEFAULTS.list;
  const defaults = Array.isArray(defaultOptions) ? defaultOptions[0] : defaultOptions;
  const mergedContent = useMemo(() => ({ ...defaults, ...content }), [defaults, content]);
  const LayoutComponent = LAYOUTS[layout] || LAYOUTS.list;

  const normalizedIdentifier = useMemo(() => {
    if (typeof siteIdentifier === 'string') {
      return siteIdentifier.trim();
    }
    return siteIdentifier;
  }, [siteIdentifier]);

  const identifierKey = typeof normalizedIdentifier === 'string'
    ? normalizedIdentifier.toLowerCase()
    : normalizedIdentifier;

  const shouldFetchPublic = useMemo(
    () => Boolean(normalizedIdentifier) && !PREVIEW_IDENTIFIERS.has(identifierKey),
    [normalizedIdentifier, identifierKey]
  );

  const shouldFetchPrivate = useMemo(
    () => !shouldFetchPublic && Boolean(siteId) && isEditing,
    [shouldFetchPublic, siteId, isEditing]
  );

  const [remoteEvents, setRemoteEvents] = useState([]);
  const [eventsStatus, setEventsStatus] = useState('idle'); // idle | loading | success | error | static

  useEffect(() => {
    if (!shouldFetchPublic && !shouldFetchPrivate) {
      setEventsStatus('static');
      setRemoteEvents([]);
      return undefined;
    }

    let isActive = true;
    setEventsStatus('loading');

    const loadPublic = async () => {
      try {
        const response = await fetchPublicBigEvents(normalizedIdentifier);
        if (!isActive) return;
        const normalized = (response?.events || []).map(normalizeBigEvent);
        setRemoteEvents(normalized);
        setEventsStatus('success');
      } catch (error) {
        console.error('[EventsSection] Failed to fetch public big events', error);
        if (!isActive) return;
        setRemoteEvents([]);
        setEventsStatus('error');
      }
    };

    const loadPrivate = async () => {
      try {
        const data = await fetchBigEvents();
        if (!isActive) return;
        const candidates = Array.isArray(data) ? data : [];
        const filtered = candidates.filter((event) => {
          if (!event) return false;
          const eventSiteId = typeof event.site === 'object' ? event.site?.id : event.site;
          return event.status === 'published' && Number(eventSiteId) === Number(siteId);
        });
        const normalized = filtered.map(normalizeBigEvent);
        setRemoteEvents(normalized);
        setEventsStatus('success');
      } catch (error) {
        console.error('[EventsSection] Failed to fetch private big events', error);
        if (!isActive) return;
        setRemoteEvents([]);
        setEventsStatus('error');
      }
    };

    if (shouldFetchPublic) {
      loadPublic();
    } else if (shouldFetchPrivate) {
      loadPrivate();
    }

    return () => {
      isActive = false;
    };
  }, [shouldFetchPublic, shouldFetchPrivate, normalizedIdentifier, siteId]);

  const hasRemoteData = shouldFetchPublic || shouldFetchPrivate;
  const events = hasRemoteData ? remoteEvents : (mergedContent.events || []);
  const enrichedContent = { ...mergedContent, events };
  const statusProp = hasRemoteData ? eventsStatus : 'static';

  return (
    <LayoutComponent
      content={enrichedContent}
      style={style}
      siteIdentifier={siteIdentifier}
      siteId={siteId}
      eventsStatus={statusProp}
      isEditing={isEditing}
      moduleId={moduleId}
      pageId={pageId}
    />
  );
};

EventsSection.descriptor = EVENTS_DESCRIPTOR;
export default EventsSection;
