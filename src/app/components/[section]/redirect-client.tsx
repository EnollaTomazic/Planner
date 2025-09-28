"use client";

import { useEffect } from "react";

interface ComponentsSectionRedirectProps {
  target: string;
}

export function ComponentsSectionRedirect({
  target,
}: ComponentsSectionRedirectProps) {
  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <main aria-busy="true">
      <p aria-live="polite" role="status">
        Redirecting to the selected components section…
      </p>
    </main>
  );
}
