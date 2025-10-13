import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';

const BLOCK_STATES = {
    UNBLOCKED: 'unblocked',
    BLOCKED: 'blocked',
    PROCEEDING: 'proceeding'
};

const useNavigationBlocker = (shouldBlock) => {
    const navigator = useContext(UNSAFE_NavigationContext)?.navigator;
    const [state, setState] = useState(BLOCK_STATES.UNBLOCKED);
    const txRef = useRef(null);
    const unblockRef = useRef(null);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (!shouldBlock) {
                return;
            }
            event.preventDefault();
            // For legacy browsers
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [shouldBlock]);

    useEffect(() => {
        if (!shouldBlock) {
            if (unblockRef.current) {
                unblockRef.current();
                unblockRef.current = null;
            }
            txRef.current = null;
            if (state !== BLOCK_STATES.UNBLOCKED) {
                setState(BLOCK_STATES.UNBLOCKED);
            }
            return;
        }

        if (!navigator?.block) {
            console.warn('Navigation blocking is not supported by the current router.');
            return;
        }

        if (unblockRef.current) {
            return;
        }

        unblockRef.current = navigator.block((tx) => {
            txRef.current = tx;
            setState(BLOCK_STATES.BLOCKED);
        });

        return () => {
            if (unblockRef.current) {
                unblockRef.current();
                unblockRef.current = null;
            }
        };
    }, [navigator, shouldBlock, state]);

    const proceed = useCallback(() => {
        if (!txRef.current) {
            return;
        }
        const tx = txRef.current;
        txRef.current = null;
        setState(BLOCK_STATES.PROCEEDING);
        if (unblockRef.current) {
            unblockRef.current();
            unblockRef.current = null;
        }
        tx.retry();
    }, []);

    const reset = useCallback(() => {
        txRef.current = null;
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
