import { Spinner } from "@/components/ui";

export default function SpinnerShowcase() {
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex items-center gap-[var(--space-4)]">
        <Spinner size={16} />
        <Spinner size={24} />
        <Spinner size={32} />
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
