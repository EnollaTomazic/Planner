'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import useHashScroll from '@/hooks/useHashScroll';
import scrollToHash from '@/lib/scrollToHash';

export default function HashScrollEffect(): null {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = useMemo(
    () => (searchParams ? searchParams.toString() : ''),
    [searchParams],
  );
  const routeKey = useMemo(() => {
    const basePath = pathname ?? '/';

    return searchString ? `${basePath}?${searchString}` : basePath;
  }, [pathname, searchString]);
  const scrollPositionsRef = useRef(new Map<string, number>());
  const activeRouteKeyRef = useRef<string | null>(null);

  useEffect(() => {
    setContainer(document.getElementById('scroll-root'));
  }, []);

  useHashScroll({
    container: container ?? undefined,
    behavior: 'smooth',
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (!container) {
      return;
    }

    const handleScroll = () => {
      const key = activeRouteKeyRef.current;

      if (!key) {
        return;
      }

      scrollPositionsRef.current.set(key, container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [container]);

  useEffect(() => {
    if (!container) {
      return;
    }

    const previousKey = activeRouteKeyRef.current;

    if (previousKey) {
      scrollPositionsRef.current.set(previousKey, container.scrollTop);
    }

    activeRouteKeyRef.current = routeKey;

    if (typeof window !== 'undefined' && window.location.hash) {
      return;
    }

    const savedPosition = scrollPositionsRef.current.get(routeKey) ?? 0;

    if (container.scrollTop !== savedPosition) {
      container.scrollTo({ top: savedPosition });
    }
  }, [routeKey, container]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash || !container) {
      return;
    }

    const timeout = window.setTimeout(() => {
      scrollToHash(window.location.hash, {
        container,
        behavior: 'smooth',
      });
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [routeKey, container]);

  return null;
}
