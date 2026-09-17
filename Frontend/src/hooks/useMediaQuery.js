import { useState, useEffect, useCallback } from "react";

/**
 * SSR-safe media query hook.
 * @param {string} query - CSS media query string, e.g. "(max-width: 767px)"
 * @returns {boolean} Whether the media query currently matches.
 */
export function useMediaQuery(query) {
  const getMatches = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  }, [query]);

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);

    // Set initial value
    setMatches(mql.matches);

    // Modern browsers
    if (mql.addEventListener) {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
    // Fallback for older Safari
    mql.addListener(handler);
    return () => mql.removeListener(handler);
  }, [query]);

  return matches;
}

/**
 * Returns true when the viewport is below the md breakpoint (768px).
 * SSR-safe — defaults to false on the server.
 */
export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}

export default useMediaQuery;
