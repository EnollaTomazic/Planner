import { Spinner } from "@/components/ui";

export default function SpinnerShowcase() {
  return (
    <div className="flex items-center gap-4">
      <Spinner size="var(--space-4)" />
      <Spinner size="var(--space-5)" />
      <Spinner size="var(--space-6)" />
    </div>
  );
}
