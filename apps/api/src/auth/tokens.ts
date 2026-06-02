import { createHmac, timingSafeEqual } from "node:crypto";
import type { AuthUser, UserRole } from "@itss/shared";

const defaultAccessTokenTtlSeconds = 60 * 60 * 8;

type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
};

export function createAccessToken(user: Pick<AuthUser, "id" | "email" | "role">) {
  const now = Math.floor(Date.now() / 1000);
  const payload: AccessTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + readAccessTokenTtlSeconds()
  };

  return signJwt(payload);
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) return null;

  const expectedSignature = createSignature(`${header}.${payload}`);
  const expected = Buffer.from(expectedSignature);
  const actual = Buffer.from(signature);

  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  let parsedPayload: AccessTokenPayload;

  try {
    parsedPayload = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AccessTokenPayload;
  } catch {
    return null;
  }

  if (!parsedPayload.sub || !parsedPayload.exp || parsedPayload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return parsedPayload;
}

function signJwt(payload: AccessTokenPayload) {
  const header = encodeBase64Url({ alg: "HS256", typ: "JWT" });
  const body = encodeBase64Url(payload);
  const signature = createSignature(`${header}.${body}`);

  return `${header}.${body}.${signature}`;
}

function createSignature(value: string) {
  return createHmac("sha256", readJwtSecret()).update(value).digest("base64url");
}

function encodeBase64Url(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function readJwtSecret() {
  return process.env.JWT_SECRET ?? "development-secret-change-me";
}

function readAccessTokenTtlSeconds() {
  const value = Number(process.env.ACCESS_TOKEN_TTL_SECONDS);

  return Number.isFinite(value) && value > 0 ? value : defaultAccessTokenTtlSeconds;
}
