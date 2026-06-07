import { AsyncLocalStorage } from "node:async_hooks";

type RuntimeEnv = Record<string, unknown>;

const runtimeEnvStorage = new AsyncLocalStorage<RuntimeEnv>();

function normalizeRuntimeEnv(env: unknown): RuntimeEnv {
  if (env && typeof env === "object") {
    return env as RuntimeEnv;
  }

  return {};
}

export function runWithRuntimeEnv<T>(env: unknown, callback: () => T): T {
  return runtimeEnvStorage.run(normalizeRuntimeEnv(env), callback);
}

export function getRuntimeEnv(name: string): string | undefined {
  const value = runtimeEnvStorage.getStore()?.[name];

  if (typeof value === "string") return value;
  if (value == null) return undefined;

  return String(value);
}