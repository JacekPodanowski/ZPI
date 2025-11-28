import { useEffect, useRef } from 'react';
import { startPrefetching, PREFETCH_PRIORITY } from './prefetch';

/**
 * Hook that starts prefetching lazy-loaded pages in the background
 * after the current page has finished loading.
 * 
 * Usage:
 *   usePrefetch({ isAuthenticated: true }); // In your main layout component
 * 
 * Options:
 *   delay: ms to wait after mount before starting (default: 1500)
 *   startFromPriority: skip higher priorities (default: CRITICAL)
 *   isAuthenticated: whether user is logged in (affects priority order)
 */
export const usePrefetch = (options = {}) => {
  const { 
    delay = 1500, 
    startFromPriority = PREFETCH_PRIORITY.CRITICAL,
    isAuthenticated = true
  } = options;
  
  const hasStarted = useRef(false);

  useEffect(() => {
    // Only run once per session
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Wait for current page to be interactive, then start prefetching
    const timeoutId = setTimeout(() => {
      startPrefetching({ startFromPriority, isAuthenticated });
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [delay, startFromPriority, isAuthenticated]);
};

export default usePrefetch;
