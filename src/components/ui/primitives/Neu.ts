const EXACT_SPACING_TOKENS = new Map<number, string>([
  [1, "--spacing-0-25"],
  [2, "--spacing-0-5"],
  [3, "--spacing-0-75"],
  [4, "--space-1"],
  [8, "--space-2"],
  [12, "--space-3"],
  [16, "--space-4"],
  [24, "--space-5"],
  [32, "--space-6"],
  [48, "--space-7"],
  [64, "--space-8"],
]);

const formatMultiplier = (value: number) => Number(value.toFixed(4)).toString();

const toSpacingValue = (value: number): string => {
  if (value === 0) {
    return "0";
  }

  const token = EXACT_SPACING_TOKENS.get(Math.abs(value));

  if (token) {
    return value < 0 ? `calc(var(${token}) * -1)` : `var(${token})`;
  }

  return `calc(var(--space-1) * ${formatMultiplier(value / 4)})`;
};

export const neuRaised = (d = 12) => {
  const offset = toSpacingValue(d);
  const blur = toSpacingValue(d * 2);
  const negativeOffset = toSpacingValue(-d);

  return `${offset} ${offset} ${blur} hsl(var(--panel)/0.72), ${negativeOffset} ${negativeOffset} ${blur} hsl(var(--foreground)/0.06)`;
};

export const neuInset = (d = 10) => {
  const offset = Math.round(d * 0.7);
  const blur = Math.round(d * 1.6);
  const positiveOffset = toSpacingValue(offset);
  const negativeOffset = toSpacingValue(-offset);
  const blurValue = toSpacingValue(blur);

  return `inset ${positiveOffset} ${positiveOffset} ${blurValue} hsl(var(--panel)/0.85), inset ${negativeOffset} ${negativeOffset} ${blurValue} hsl(var(--foreground)/0.08)`;
};
