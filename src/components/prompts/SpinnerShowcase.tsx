import { Spinner } from "@/components/ui";

export default function SpinnerShowcase() {
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
    </div>
  );
}
