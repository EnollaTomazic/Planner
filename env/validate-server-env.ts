import loadServerEnv from "./server";

try {
  loadServerEnv();
} catch (error) {
  console.error("[env] Failed to load server environment variables.", error);

  if (typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
    process.exitCode = 1;
  }

  throw error;
}
