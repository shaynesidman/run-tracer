import { useEffect, useCallback } from 'react';

export default function useEscapeKey(callback: () => void) {
    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            callback();
        }
    }, [callback]);

    useEffect(() => {
        window.addEventListener('keydown', handleEscape);
        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [handleEscape]);
}