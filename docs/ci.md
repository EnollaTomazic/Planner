# Continuous integration guidance

## Visual regression workflow

Use the **Visual Regression** workflow when you need a manual snapshot of the UI before promoting a build. The job reuses our Node base workflow, installs dependencies, and runs the Playwright visual diff suite across Chromium, Firefox, and WebKit desktop profiles.

### Triggering a run

1. Open the repository’s **Actions** tab and select **Visual Regression** from the workflow list.
2. Choose the branch, tag, or commit to test in the **Run workflow** drawer. Leave the field blank to use the branch you selected in the UI.
3. Optionally set the environment label (e.g., `staging`, `preview`) so the summary records where the screenshots originated.
4. Start the run and wait for the matrix jobs to finish.

### What the workflow executes

- For each surface in the matrix (`Chromium · Desktop`, `Firefox · Desktop`, `WebKit · Desktop`) the runner:
  - Fetches and checks out the requested ref.
  - Installs Playwright browsers via the Node base reusable workflow.
  - Runs `npx playwright test --config=playwright.visual.config.ts --project=<target> --grep "@visual" --output=playwright-visual/<target>` to produce fresh baselines and diffs.
  - Uploads `visual-diff-<target>` artifacts that include the Playwright traces, screenshots, and a short summary file.

### Reading the results

- The workflow summary lists the ref, environment label, and whether any target reported differences.
- A failing Playwright run marks its matrix job as failed, but the workflow is manual-only and therefore optional—production deployments continue to rely on the standard CI gate.
- Download the relevant `visual-diff-<target>` artifact to review `*.png` diffs, traces, or the generated `summary.md` file when you need to investigate a regression.
