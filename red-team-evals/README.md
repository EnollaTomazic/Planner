# Red Team Prompt Sanitization Samples

This directory exercises hostile prompt inputs against `sanitizePrompt` to verify the normalisation and escaping behaviour used across the app.

## Sanitisation pipeline reference
The cases mirror the steps implemented in [`sanitizePrompt`](../src/ai/safety.ts):

1. Convert Windows newlines to Unix line feeds and trim trailing whitespace from each line.
2. Strip control characters such as bell (`\u0007`) and delete (`\u007f`).
3. Collapse runs of blank lines down to two and squeeze tabs or multiple spaces into a single space.
4. Apply grapheme-aware truncation to respect the configured maximum input length.
5. Escape HTML-unsafe characters unless `allowMarkup` is set, delegating to `sanitizeText` for final output encoding.

See the inline comments in `src/ai/safety.ts` for the authoritative implementation.

## Replay instructions

1. Install dependencies if needed: `pnpm install`
2. Execute the replay script to inspect current behaviour:
   ```bash
   pnpm exec tsx red-team-evals/replay.ts
   ```
3. The script prints each hostile input alongside the expected sanitised output and the live result from `sanitizePrompt` for quick diffing.

> [!NOTE]
> The script seeds `NEXT_PUBLIC_SAFE_MODE=false` automatically so it can reuse the production sanitiser without requiring additional environment setup.

Update `samples.json` and rerun the script whenever the sanitisation logic changes.
