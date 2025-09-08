"use client";
import "./style.css";

export default function StatsStrip({
  total,
  shown,
  selected,
}: {
  total: number;
  shown: number;
  selected: boolean;
}) {
  return (
    <div className="segmented rounded-2xl px-3 py-2 text-xs text-muted-foreground flex items-center gap-3">
      <span>Total: <b className="text-foreground">{total}</b></span>
      <span>Shown: <b className="text-foreground">{shown}</b></span>
      <span>Selected: <b className="text-foreground">{selected ? "Yes" : "No"}</b></span>
    </div>
  );
}
