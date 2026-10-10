import assert from "node:assert/strict";
import type { TestContext } from "node:test";
import dotenv from "dotenv";
import { NoteAPIClient } from "../../src";
import { checkContract } from "./contract";

dotenv.config({ quiet: true } as any);

/** Anonymous client for public endpoints. */
export function liveClient(cookies?: string) {
  return new NoteAPIClient({ cookies, proxyUrl: process.env.PROXY_URL || undefined });
}

/** note.com rate limits aggressive clients; keep live tests polite. */
export const pause = (ms = 300) => new Promise((r) => setTimeout(r, ms));

/** Asserts that `value` matches the exported TS type `typeName`. */
export function assertContract(t: TestContext, value: unknown, typeName: string) {
  const { errors, extra } = checkContract(value, typeName);
  if (extra.length) t.diagnostic(`${typeName} has undeclared fields: ${extra.join(", ")}`);
  assert.deepEqual(errors, [], `${typeName} does not match the live response`);
}
