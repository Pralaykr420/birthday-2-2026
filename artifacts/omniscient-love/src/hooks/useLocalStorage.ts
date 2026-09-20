import { useCallback, useEffect, useState } from 'react';

/**
 * Like useState, except the value survives closing the app.
 *
 * Use it exactly like useState:
 *   const [favourites, setFavourites] = useLocalStorage('favourites', []);
 *
 * The `key` is the name it is filed under in the phone's storage. Prefix
 * everything with 'omniscient:' so we never collide with another app.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const storageKey = `omniscient:${key}`;

  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved === null ? initialValue : (JSON.parse(saved) as T);
    } catch {
      // Private browsing blocks storage. The app still works, it just forgets.
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // See above - forgetting is acceptable, crashing is not.
    }
  }, [storageKey, value]);

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return [value, setValue, reset] as const;
}
