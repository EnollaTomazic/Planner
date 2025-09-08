import type { Reporter, Vitest } from "vitest";
import { MultiBar } from "cli-progress";

export default function progressReporter(): Reporter {
  let bars: any = null;
  let startedBar: any = null;
  let finishedBar: any = null;
  let total = 0;
  let started = 0;
  let finished = 0;

  return {
    onInit(ctx: Vitest) {
      const files = ctx.state.getFiles() as any[];
      total = files.reduce(
        (sum, file) => sum + (file.tasks?.length ?? 0),
        0,
      );
      if (total > 0) {
        bars = new MultiBar(
          { clearOnComplete: false, hideCursor: true },
          MultiBar.Presets.shades_grey,
        );
        startedBar = bars.create(total, 0, {
          format: "{bar} Started {value}/{total}",
        });
        finishedBar = bars.create(total, 0, {
          format: "{bar} Completed {value}/{total}",
        });
      }
    },
    onTestCaseReady() {
      if (startedBar) {
        started += 1;
        startedBar.update(started);
      }
    },
    onTestCaseResult() {
      if (finishedBar) {
        finished += 1;
        finishedBar.update(finished);
      }
    },
    onFinished() {
      bars?.stop();
    },
  };
}
