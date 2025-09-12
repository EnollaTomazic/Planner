import { Spinner } from "@/components/ui";

export default function SpinnerShowcase() {
  return (
    <div className="flex items-center gap-4">
      <Spinner size={16} />
      <Spinner size={24} />
      <Spinner size={32} />
    </div>
  );
}
