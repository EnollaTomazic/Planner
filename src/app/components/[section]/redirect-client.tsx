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
    <div aria-busy="true" role="status">
      <p aria-live="polite">
        Redirecting to the selected components section…
      </p>
    </div>
  );
}
