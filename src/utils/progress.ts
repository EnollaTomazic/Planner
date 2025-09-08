import { MultiBar, Presets } from "cli-progress";

const bars = new MultiBar(
  { clearOnComplete: false, hideCursor: true },
  Presets.shades_grey,
);

export const createTaskBar = (totalSteps: number): ReturnType<MultiBar["create"]> =>
  bars.create(totalSteps, 0);

export const stopBars = (): void => {
  bars.stop();
};

