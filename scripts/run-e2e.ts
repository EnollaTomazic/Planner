import { spawn } from "node:child_process";
import process from "node:process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";

const host = process.env.PLAYWRIGHT_HOST ?? "127.0.0.1";
const port = Number.parseInt(process.env.PLAYWRIGHT_PORT ?? "3080", 10);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://${host}:${port}`;

async function waitForServer(url: string, attempts = 30, interval = 500) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.ok || response.status === 308 || response.status === 200) {
        return;
      }
    } catch {
      // retry
    }
    await delay(interval);
  }
  throw new Error(`Timed out waiting for dev server at ${url}`);
}

async function run() {
  if (process.env.PLAYWRIGHT_INSTALL !== "false") {
    await once(
      spawn("pnpm", ["exec", "playwright", "install", "--with-deps"], {
        stdio: "inherit",
      }),
      "exit",
    );
  }

  const server = spawn("pnpm", ["run", "dev"], {
    env: { ...process.env, PORT: String(port), HOSTNAME: host },
    stdio: "inherit",
  });

  const stopServer = () => {
    server.kill("SIGINT");
  };

  process.on("SIGINT", stopServer);
  process.on("SIGTERM", stopServer);

  await waitForServer(`${baseURL}/`);

  const result = await once(
    spawn("pnpm", ["exec", "playwright", "test"], {
      env: {
        ...process.env,
        PLAYWRIGHT_BASE_URL: baseURL,
        PLAYWRIGHT_HOST: host,
        PLAYWRIGHT_PORT: String(port),
      },
      stdio: "inherit",
    }),
    "exit",
  );

  stopServer();

  const [code] = result;
  process.exit(typeof code === "number" ? code : 0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
