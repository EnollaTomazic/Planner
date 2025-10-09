# AI Safety Controls

This document explains how the Planner backend keeps AI interactions within safe operational boundaries and how to tune the most common safeguards.

## Key Constants and Defaults

- **`AI_MAX_INPUT_LENGTH`** – Controls the maximum number of Unicode grapheme clusters that `sanitizePrompt` will keep from user input. If the environment variable is unset, the code falls back to 16,000 characters. The value is clamped to a positive integer when loaded. 【F:src/ai/safety.ts†L11-L19】【F:src/ai/safety.ts†L168-L188】
- **`AI_TOKENS_PER_CHAR`** – Used by the default token estimator (`characterCount / tokensPerCharacter`) to approximate how many tokens a message will consume. Accepts fractional values and defaults to 4 when no override is provided. `AI_TOKENS_PER_CHARACTER` is treated as an alias. 【F:src/ai/safety.ts†L20-L26】【F:src/ai/safety.ts†L211-L218】
- **Safe-mode overrides** – When safe mode is active, token budgets and model behaviour are constrained:
  - `SAFE_MODE_TOKEN_CEILING` caps the total request budget at 8,000 tokens. 【F:src/ai/safety.ts†L27-L33】【F:src/ai/safety.ts†L220-L234】
  - `SAFE_MODE_RESPONSE_RESERVE` ensures at least 512 tokens remain for the model response, even if a caller reserved less. 【F:src/ai/safety.ts†L27-L33】【F:src/ai/safety.ts†L220-L234】
  - `SAFE_MODE_TEMPERATURE_CEILING` limits creative variance to a temperature of 0.4. 【F:src/ai/safety.ts†L27-L33】【F:src/ai/safety.ts†L536-L558】
  - `SAFE_MODE_MAX_TOOL_CALLS` restricts tool invocation to a single call per response when tools are allowed. 【F:src/ai/safety.ts†L27-L33】【F:src/ai/safety.ts†L536-L558】

Safe mode applies automatically when both the user-facing feature flag and the `SAFE_MODE` server environment flag are enabled. 【F:src/ai/safety.ts†L226-L233】

## Tuning Guidance

1. **Override via environment variables**
   - Set `AI_MAX_INPUT_LENGTH` or `AI_TOKENS_PER_CHAR` in `.env.local` to adjust defaults without code changes. Values are validated—non-numeric or out-of-range entries fall back to the compiled defaults. 【F:src/ai/safety.ts†L11-L26】【F:src/ai/safety.ts†L89-L133】
   - Toggle safe mode by setting `SAFE_MODE=1` (or `true`, `on`, `yes`) in deployment environments where stricter behaviour is required. 【F:src/ai/safety.ts†L82-L161】

2. **Budgeting for responses**
   - Prefer setting `reservedForResponse` when calling `enforceTokenBudget` so downstream responses have enough space. Safe mode enforces a minimum reserve of 512 tokens, so plan higher reserves only when you expect verbose completions. 【F:src/ai/safety.ts†L220-L234】

3. **Token estimation adjustments**
   - For multilingual or highly formatted prompts, consider supplying a custom `estimateTokens` function to `enforceTokenBudget`. If you rely on the default estimator, tune `AI_TOKENS_PER_CHAR` to align with the target model’s average token-per-character ratio. 【F:src/ai/safety.ts†L211-L234】

4. **Testing safe-mode boundaries**
   - After changing these values, run prompt verification suites (`pnpm run verify-prompts`) to ensure flows continue to respect the new limits and to catch unexpected truncation or budget removals.

## Behaviour Examples

```ts
import { applyModelSafety, enforceTokenBudget, sanitizePrompt } from '@/ai/safety';
```

### Input sanitisation

```ts
sanitizePrompt('Hello, world!   \n\n\nExtra', { maxLength: 12 });
// => 'Hello, world' (collapses whitespace, trims, then truncates to 12 grapheme clusters)
```

Safe mode does not affect sanitisation, but lowering `AI_MAX_INPUT_LENGTH` reduces the `maxLength` default.

### Token budgeting

```ts
const history = [
  { content: 'Pinned system rules', pinned: true },
  { content: 'Very long user input…' },
];

enforceTokenBudget(history, { maxTokens: 9000, reservedForResponse: 256 });
// Safe mode OFF → keeps both messages if total <= 8744 tokens (9000 - 256)
// Safe mode ON  → max budget shrinks to 7488 tokens (8000 - max(256, 512)),
//                 so non-pinned messages beyond that threshold are dropped
```

Safe mode requires both the feature flag and `SAFE_MODE` environment variable to be true; otherwise only the caller’s `maxTokens` and reserve apply. 【F:src/ai/safety.ts†L220-L234】

### Model parameters

```ts
applyModelSafety({ temperature: 0.9, toolChoice: { mode: 'auto', maxToolCalls: 3 } });
// Safe mode OFF → { temperature: 0.9, toolChoice: { mode: 'auto', maxToolCalls: 3 }, safeMode: false }
// Safe mode ON  → { temperature: 0.4, toolChoice: { mode: 'auto', maxToolCalls: 1 }, safeMode: true }
```

When safe mode is active, temperature and tool call allowances are clamped, while a disabled safe mode preserves the caller’s requested values. 【F:src/ai/safety.ts†L536-L558】
