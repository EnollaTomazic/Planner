import * as React from "react";

export const hasTextContent = (node: React.ReactNode): boolean => {
  if (node === null || node === undefined) return false;
  if (typeof node === "boolean") return false;
  if (typeof node === "string") return node.trim().length > 0;
  if (typeof node === "number") return true;
  if (Array.isArray(node)) return node.some((item) => hasTextContent(item));
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return hasTextContent(node.props.children ?? null);
  }
  return false;
};

export function observeMediaQuery(
  query: string,
  onChange: (matches: boolean, mediaQuery: MediaQueryList) => void,
): (() => void) | undefined {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return undefined;
  }

  let mediaQuery: MediaQueryList;

  try {
    mediaQuery = window.matchMedia(query);
  } catch {
    return undefined;
  }

  const handleChange = (event: MediaQueryListEvent): void => {
    onChange(event.matches, mediaQuery);
  };

  const handleLegacyChange = (): void => {
    onChange(mediaQuery.matches, mediaQuery);
  };

  onChange(mediaQuery.matches, mediaQuery);

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }

  if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(handleLegacyChange);
    return () => {
      mediaQuery.removeListener(handleLegacyChange);
    };
  }

  return undefined;
}

export function useMatchMedia(
  query: string,
  getServerSnapshot?: () => boolean,
): boolean {
  const getMatches = React.useCallback(() => {
    if (typeof window === "undefined") {
      return typeof getServerSnapshot === "function" ? getServerSnapshot() : false;
    }

    if (typeof window.matchMedia !== "function") {
      return false;
    }

    try {
      return window.matchMedia(query).matches;
    } catch {
      return false;
    }
  }, [query, getServerSnapshot]);

  const [matches, setMatches] = React.useState<boolean>(getMatches);

  React.useEffect(() => {
    return observeMediaQuery(query, (nextMatches) => {
      setMatches(nextMatches);
    });
  }, [query]);

  return matches;
}
