import { Spinner } from "@/components/ui";

export function SpinnerShowcase() {
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex items-center gap-[var(--space-4)]">
        <Spinner size="sm" />
        <Spinner size="lg" />
        <Spinner size="xl" />
      </div>
      <div className="flex items-center gap-[var(--space-4)]">
        <Spinner tone="primary" />
        <Spinner tone="accent" />
        <Spinner tone="info" />
        <Spinner tone="danger" />
      </div>
      <p className="text-ui text-muted-foreground">
        Spinners respect reduced motion preferences, halting animation while preserving tone tokens when motion is disabled.
      </p>
    </div>
  );
}
