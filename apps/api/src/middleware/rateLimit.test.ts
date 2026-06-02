import assert from "node:assert/strict";
import { test } from "node:test";
import { createMemoryRateLimitStore } from "./rateLimit.js";

test("rate limit store blocks requests above the window limit", () => {
  let now = 1_000;
  const store = createMemoryRateLimitStore(() => now);

  assert.equal(store.consume("client-a", 2, 1_000).allowed, true);
  assert.equal(store.consume("client-a", 2, 1_000).allowed, true);

  const thirdRequest = store.consume("client-a", 2, 1_000);

  assert.equal(thirdRequest.allowed, false);
  assert.equal(thirdRequest.remaining, 0);
});

test("rate limit store opens a fresh bucket after reset", () => {
  let now = 1_000;
  const store = createMemoryRateLimitStore(() => now);

  assert.equal(store.consume("client-b", 1, 1_000).allowed, true);
  assert.equal(store.consume("client-b", 1, 1_000).allowed, false);

  now = 2_001;

  assert.equal(store.consume("client-b", 1, 1_000).allowed, true);
});
