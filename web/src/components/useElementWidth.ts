import { useEffect, useState } from "react";

/**
 * A custom hook: measures an element's width and re-renders when it changes.
 *
 * It returns a *callback ref* (a function React calls with the DOM node)
 * rather than a useRef object, so it still works if the element mounts later
 * — e.g. after the chart's "no data" state.
 *
 * The generic <T extends HTMLElement> lets the caller say which element type
 * the ref goes on, so TypeScript checks it against <figure>, <div>, etc.
 */
export function useElementWidth<T extends HTMLElement>(fallback = 720) {
  const [element, setElement] = useState<T | null>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect(); // cleanup when the element goes away
  }, [element]);

  return [setElement, width] as const;
}
