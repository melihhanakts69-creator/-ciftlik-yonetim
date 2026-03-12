import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Ekran genişliği 768px ve altındaysa true (mobil).
 * PC layout'a dokunulmaz; mobil bileşenler sadece bu hook true döndüğünde render edilir.
 */
export function useMediaQuery(query = `(max-width: ${MOBILE_BREAKPOINT}px)`) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/** Mobil (≤768px) ise true. */
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);
}
