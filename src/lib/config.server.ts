// Server-only config. The .server.ts suffix prevents Vite from bundling
// this file into the client — values here never reach the browser.
//
// On Cloudflare Workers, env binds at request time. Read values from the
// request-scoped runtime env helper, never from Node globals.
//
// When to use which env-access pattern:
//   - .server.ts module (this file): server-only helpers reused across
//     handlers. Wrap reads in a function so they run per-request.
//   - inline getRuntimeEnv("NAME") inside a createServerFn handler: one-off
//     reads not reused elsewhere.
//   - import.meta.env.VITE_FOO: PUBLIC config readable from both client
//     and server (analytics IDs, public URLs). Define in .env with the
//     VITE_ prefix. Never put secrets here — they ship to the browser.

import { getRuntimeEnv } from "./runtime-env.server";

export function getServerConfig() {
  return {
    nodeEnv: getRuntimeEnv("NODE_ENV"),
    // Add server-only values here, e.g.:
    //   databaseUrl: getRuntimeEnv("DATABASE_URL"),
    //   stripeSecretKey: getRuntimeEnv("STRIPE_SECRET_KEY"),
  };
}
