import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
  interval: number;      // milliseconds between polls
  enabled?: boolean;     // whether polling is active
  immediate?: boolean;   // call immediately on mount
}

export const usePolling = (
  callback: () => Promise<void> | void,
  options: UsePollingOptions
) => {
  const { interval, enabled = true, immediate = true } = options;
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Always use latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    if (enabled) {
      timerRef.current = setInterval(() => {
        callbackRef.current();
      }, interval);
    }
  }, [interval, enabled, stop]);

  useEffect(() => {
    if (immediate && enabled) {
      callbackRef.current();
    }
    start();
    return stop;
  }, [enabled, immediate, start, stop]);

  return { start, stop };
};
