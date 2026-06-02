import { ShieldCheck } from "lucide-react";
import type { VerificationLevel } from "@itss/shared";
import { verificationLevels } from "../data/documentMeta";

type VerificationBadgeProps = {
  level: VerificationLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
};

const sizeClass = {
  sm: "verification-badge--sm",
  md: "verification-badge--md",
  lg: "verification-badge--lg"
};

export function VerificationBadge({ level, size = "md", showLabel = true }: VerificationBadgeProps) {
  const config = verificationLevels[level];

  return (
    <span
      className={`verification-badge ${sizeClass[size]}`}
      style={{ backgroundColor: config.bgColor, color: config.color, borderColor: `${config.color}33` }}
      title={config.description}
    >
      <ShieldCheck aria-hidden="true" />
      {showLabel ? <span>{config.shortLabel}</span> : null}
    </span>
  );
}
