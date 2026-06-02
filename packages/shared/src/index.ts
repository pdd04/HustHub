export const verificationLevels = ["unverified", "bronze", "silver", "gold"] as const;

export type VerificationLevel = (typeof verificationLevels)[number];
