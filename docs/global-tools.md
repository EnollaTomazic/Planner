# Global Developer Tools

The development environment now ships with the official `@openai/codex-sdk` so you can script Codex agents without installing extra packages locally. Create a small helper such as `scripts/codex-demo.ts` and run it with `pnpm exec tsx` or `node`:

```ts
import { Codex } from '@openai/codex-sdk';

async function main() {
  const agent = new Codex();
  const thread = await agent.startThread();

  const explore = await thread.run('Explore this repo');
  console.log(explore);

  const proposal = await thread.run('Propose changes');
  console.log(proposal);
}

main().catch((error) => {
  console.error('Codex run failed:', error);
  process.exitCode = 1;
});
```

The SDK reads credentials from the standard OpenAI environment variables (`OPENAI_API_KEY`, optional `OPENAI_BASE_URL`). Threads cache conversation state automatically, so reuse the `thread` instance when chaining additional review prompts.
