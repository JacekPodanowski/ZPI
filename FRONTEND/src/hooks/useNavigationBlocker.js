import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';

const BLOCK_STATES = {
    UNBLOCKED: 'unblocked',
    BLOCKED: 'blocked',
    PROCEEDING: 'proceeding'
};

const useNavigationBlocker = (shouldBlock) => {
    const navigationContext = useContext(UNSAFE_NavigationContext);
    const navigator = navigationContext?.navigator;
    const routerLike = navigator?.router || navigator;

    const [state, setState] = useState(BLOCK_STATES.UNBLOCKED);
    const blockerIdRef = useRef(`studio-blocker-${Math.random().toString(36).slice(2)}`);
    const cleanupRef = useRef(null);
    const controlsRef = useRef({
        proceed: null,
        reset: null
    });

    useEffect(() => {
        return () => {};
    }, []);

    useEffect(() => {
        const releaseBlocker = () => {
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }

            controlsRef.current = { proceed: null, reset: null };
            setState(BLOCK_STATES.UNBLOCKED);
        };

        if (!shouldBlock) {
            releaseBlocker();
            return undefined;
        }

        if (!routerLike) {
            console.warn('Navigation blocking is unavailable: router context missing.');
            return undefined;
        }

        if (typeof routerLike.getBlocker === 'function') {
            const blockerId = blockerIdRef.current;

            const blocker = routerLike.getBlocker(blockerId, (transition) => {
                setState(BLOCK_STATES.BLOCKED);

                const proceedFn = transition?.proceed
                    || transition?.retry
                    || blocker?.proceed
                    || routerLike.proceed;
                const resetFn = transition?.reset
                    || transition?.cancel
                    || blocker?.reset
                    || routerLike.reset;

                controlsRef.current = {
                    proceed: typeof proceedFn === 'function' ? () => {
                        setState(BLOCK_STATES.PROCEEDING);
                        proceedFn();
                    } : null,
                    reset: typeof resetFn === 'function' ? () => {
                        setState(BLOCK_STATES.UNBLOCKED);
                        resetFn();
                    } : null
                };
            });

            cleanupRef.current = () => {
                if (blocker?.delete) {
                    blocker.delete();
                } else if (typeof routerLike.deleteBlocker === 'function') {
                    routerLike.deleteBlocker(blockerId);
                }
            };

            return () => {
                releaseBlocker();
            };
        }

        if (typeof navigator?.block === 'function') {
            const unblock = navigator.block((tx) => {
                setState(BLOCK_STATES.BLOCKED);
                controlsRef.current = {
                    proceed: () => {
                        setState(BLOCK_STATES.PROCEEDING);
                        tx.retry();
                    },
                    reset: () => {
                        setState(BLOCK_STATES.UNBLOCKED);
                    }
                };
            });

            cleanupRef.current = () => {
                unblock();
            };

            return () => {
                releaseBlocker();
            };
        }

        console.warn('Navigation blocking is not supported by the current router.');
        return undefined;
    }, [routerLike, navigator, shouldBlock]);

    const proceed = useCallback(() => {
        const handler = controlsRef.current.proceed;
        if (!handler) {
            console.warn('Navigation blocker proceed handler is not available.');
            return;
        }
        handler();
    }, []);

    const reset = useCallback(() => {
        const handler = controlsRef.current.reset;
        if (handler) {
            handler();
        } else {
            console.warn('Navigation blocker reset handler is not available.');
        }
        if (state !== BLOCK_STATES.UNBLOCKED) {
            setState(BLOCK_STATES.UNBLOCKED);
        }
    }, [state]);

    return {
        state,
        proceed,
        reset
    };
};

export default useNavigationBlocker;
export { BLOCK_STATES };
