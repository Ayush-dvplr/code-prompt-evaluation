import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of `value`.
 * The returned value only updates after `delay` ms of no changes.
 * Default delay is 300ms as required by the prompt.
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer); // cleanup on unmount or value change
  }, [value, delay]);

  return debouncedValue;
}
