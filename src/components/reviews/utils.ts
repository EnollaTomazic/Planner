export function parseTime(mmss: string): number | null {
  const m = mmss.trim().match(/^(\d{1,2}):([0-5]\d)$/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function formatSeconds(total: number): string {
  const minutes = Math.max(0, Math.floor(total / 60));
  const seconds = Math.max(0, total % 60);
  return `${String(minutes)}:${String(seconds).padStart(2, "0")}`;
}
