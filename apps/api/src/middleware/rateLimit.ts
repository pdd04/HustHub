import type { NextFunction, Request, Response } from "express";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export type RateLimitCheck = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export function createMemoryRateLimitStore(now = () => Date.now()) {
  const buckets = new Map<string, RateLimitBucket>();

  return {
    consume(key: string, limit: number, windowMs: number): RateLimitCheck {
      const currentTime = now();
      const existingBucket = buckets.get(key);
      const bucket =
        existingBucket && existingBucket.resetAt > currentTime
          ? existingBucket
          : {
              count: 0,
              resetAt: currentTime + windowMs
            };

      bucket.count += 1;
      buckets.set(key, bucket);

      return {
        allowed: bucket.count <= limit,
        remaining: Math.max(0, limit - bucket.count),
        resetAt: bucket.resetAt
      };
    },
    size() {
      return buckets.size;
    },
    prune() {
      const currentTime = now();

      for (const [key, bucket] of buckets.entries()) {
        if (bucket.resetAt <= currentTime) buckets.delete(key);
      }
    }
  };
}

export function createRateLimiter({
  maxRequests,
  windowMs
}: {
  maxRequests: number;
  windowMs: number;
}) {
  const store = createMemoryRateLimitStore();
  const limit = Math.max(1, maxRequests);
  const windowDurationMs = Math.max(1000, windowMs);

  return (request: Request, response: Response, next: NextFunction) => {
    const result = store.consume(readClientKey(request), limit, windowDurationMs);
    const retryAfterSeconds = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));

    response.setHeader("X-RateLimit-Limit", String(limit));
    response.setHeader("X-RateLimit-Remaining", String(result.remaining));
    response.setHeader("X-RateLimit-Reset", new Date(result.resetAt).toISOString());

    if (!result.allowed) {
      response.setHeader("Retry-After", String(retryAfterSeconds));
      response.status(429).json({ message: "Too many requests. Please try again later." });
      return;
    }

    next();
  };
}

function readClientKey(request: Request) {
  const forwardedFor = request.header("x-forwarded-for")?.split(",")[0]?.trim();

  return forwardedFor || request.ip || request.socket.remoteAddress || "unknown";
}
