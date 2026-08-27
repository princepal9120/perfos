import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';

/**
 * useState backed by localStorage.
 *
 * Always returns `initial` on the first render — this app is a static export, so
 * reading storage during render would desync hydration. Storage is read after
 * mount, and writes are held back until that read lands so the stored value is
 * never clobbered by the default.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(initial);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) setState(JSON.parse(item) as T);
    } catch {
      // Unavailable or corrupt storage: keep `initial`.
    }
    // Deferred: both effects run in the same flush, and this commit's write
    // effect still closes over the pre-read state. Flipping the flag now would
    // let it persist the default over what we just read.
    queueMicrotask(() => {
      hydrated.current = true;
    });
    return () => {
      hydrated.current = false;
    };
  }, [key]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Quota exceeded or storage disabled: stay in memory.
    }
  }, [key, state]);

  return [state, setState];
}
