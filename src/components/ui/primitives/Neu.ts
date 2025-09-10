export const neuRaised = (d = 12) =>
  `${d}px ${d}px ${d * 2}px hsl(var(--surface-alt)/0.72), -${d}px -${d}px ${d * 2}px hsl(var(--text)/0.06)`;

export const neuInset = (d = 10) =>
  `inset ${Math.round(d * 0.7)}px ${Math.round(d * 0.7)}px ${Math.round(d * 1.6)}px hsl(var(--surface-alt)/0.85), inset -${Math.round(d * 0.7)}px -${Math.round(d * 0.7)}px ${Math.round(d * 1.6)}px hsl(var(--text)/0.08)`;
