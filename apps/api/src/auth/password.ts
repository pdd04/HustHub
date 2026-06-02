import { scrypt as scryptCallback, timingSafeEqual, randomBytes } from "node:crypto";
const keyLength = 64;
const scryptOptions = {
  N: 16_384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024
};

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = await deriveKey(password, salt, scryptOptions);

  return `scrypt$${scryptOptions.N}$${scryptOptions.r}$${scryptOptions.p}$${salt}$${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, n, r, p, salt, expectedHash] = passwordHash.split("$");

  if (algorithm !== "scrypt" || !n || !r || !p || !salt || !expectedHash) {
    return false;
  }

  const derivedKey = await deriveKey(password, salt, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 64 * 1024 * 1024
  });

  const expected = Buffer.from(expectedHash, "base64url");

  return expected.length === derivedKey.length && timingSafeEqual(expected, derivedKey);
}

function deriveKey(password: string, salt: string, options: typeof scryptOptions) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
}
