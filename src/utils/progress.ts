import { MultiBar, Presets } from "cli-progress";

const bars = new MultiBar(
  { clearOnComplete: false, hideCursor: true },
  Presets.shades_grey,
);

export function createProgressBar(
  totalSteps: number,
): ReturnType<MultiBar["create"]> {
  return bars.create(totalSteps, 0);
}

export const stopBars = (): void => {
  bars.stop();
};

