import tokens from "../../tokens/tokens.js";

const FILTER_SLOPE_TOKEN = "--gradient-noise-opacity";
const FILTER_TABLE_TOKEN = "--gradient-noise-table";
const FILTER_STD_DEVIATION_TOKEN = "--gradient-noise-std-deviation";

const numberPattern = /-?\d*\.?\d+(?:e[+-]?\d+)?/gi;

const parsedGradientNoiseOpacity = Number.parseFloat(
  tokens.gradientNoiseOpacity,
);
const defaultSlope = Number.isFinite(parsedGradientNoiseOpacity)
  ? parsedGradientNoiseOpacity
  : 0.1;

const defaultTable = Object.freeze([0, 1] as const);
const defaultStdDeviation = 0;

const clampNumber = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const parseNumbers = (value: string): number[] => {
  if (!value) {
    return [];
  }

  const matches = value.match(numberPattern);

  if (!matches) {
    return [];
  }

  return matches
    .map((segment) => Number.parseFloat(segment))
    .filter((segment): segment is number => Number.isFinite(segment));
};

const parseNumber = (value: string): number | null => {
  const [first] = parseNumbers(value);

  if (typeof first === "number") {
    return first;
  }

  return null;
};

export interface FilterNumericValues {
  slope: number;
  table: readonly number[];
  stdDeviation: number;
}

const cloneDefaultTable = (): number[] => [...defaultTable];

const getComputedValue = (token: string): string => {
  if (typeof document === "undefined") {
    return "";
  }

  const { documentElement } = document;

  if (!documentElement) {
    return "";
  }

  return getComputedStyle(documentElement).getPropertyValue(token).trim();
};

const numericTable = (raw: string): number[] => {
  const parsed = parseNumbers(raw).map((entry) =>
    clampNumber(entry, 0, 1),
  );

  if (parsed.length === 0) {
    return cloneDefaultTable();
  }

  return parsed;
};

const numericSlope = (raw: string): number => {
  const parsed = parseNumber(raw);

  if (parsed === null) {
    return defaultSlope;
  }

  return clampNumber(parsed, 0, 1);
};

const numericStdDeviation = (raw: string): number => {
  const parsed = parseNumber(raw);

  if (parsed === null) {
    return defaultStdDeviation;
  }

  return clampNumber(parsed, 0, 64);
};

export const tokensToFilter = (): FilterNumericValues => {
  const slope = numericSlope(getComputedValue(FILTER_SLOPE_TOKEN));
  const table = numericTable(getComputedValue(FILTER_TABLE_TOKEN));
  const stdDeviation = numericStdDeviation(
    getComputedValue(FILTER_STD_DEVIATION_TOKEN),
  );

  return {
    slope,
    table,
    stdDeviation,
  };
};
