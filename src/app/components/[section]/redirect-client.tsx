'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ComponentsSectionRedirectProps {
  target: string;
}

export function ComponentsSectionRedirect({
  target,
}: ComponentsSectionRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(target);
  }, [router, target]);

  return (
    <div className="flex flex-col items-center gap-[var(--space-3)] p-[var(--space-5)] text-[var(--font-size-1)]">
      <p>Redirecting to the Planner components gallery…</p>
      <a className="text-link" href={target}>
        Continue to components
      </a>
    </div>
  );
}
