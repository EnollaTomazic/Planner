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
3. The script prints each hostile input alongside the expected sanitised output and the live result from `sanitizePrompt` for quick diffing. Scenarios now cover jailbreak directives ("ignore all previous rules" patterns), embedded payloads in markdown and HTML comments, and high-toxicity strings so both injection attempts and abuse language stay observable.
4. A summary at the end highlights the number of matching cases and lists any failing identifiers—use this section in CI logs to jump straight to regressions.

### Interpreting failures

- **Mismatch on expected output:** `sanitizePrompt` has diverged from the documented behaviour. Inspect the corresponding `expected` string in [`samples.json`](./samples.json) and update either the fixture or the implementation, depending on the intended contract.
- **Multiple failures clustered around jailbreak or toxicity samples:** double-check whether upstream safety heuristics were adjusted (e.g., new whitespace handling or escaping rules). Update the expectations only when the new behaviour is deliberate and keeps the payload inert.
- **All cases failing:** confirm `NEXT_PUBLIC_SAFE_MODE` is not overriding the runtime; the script forces it to `false`, but an exported environment or shell configuration may still interfere.

> [!NOTE]
> The script seeds `NEXT_PUBLIC_SAFE_MODE=false` automatically so it can reuse the production sanitiser without requiring additional environment setup.

Update `samples.json` and rerun the script whenever the sanitisation logic changes.
