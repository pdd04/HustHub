import { ShieldCheck } from "lucide-react";
import type { VerificationLevel } from "@itss/shared";
import { verificationLevels } from "../data/documentMeta";

type LargeVerificationSealProps = {
  level: VerificationLevel;
};

export function LargeVerificationSeal({ level }: LargeVerificationSealProps) {
  const config = verificationLevels[level];
  const text = `ĐÃ XÁC MINH • ${config.label.toUpperCase()} • ĐÃ XÁC MINH • ${config.label.toUpperCase()} •`;

  return (
    <div className="verification-seal" style={{ color: config.color }}>
      <svg className="verification-seal__ring" viewBox="0 0 140 140" aria-hidden="true">
        <defs>
          <path id={`seal-path-${level}`} d="M 70, 70 m -58, 0 a 58,58 0 1,1 116,0 a 58,58 0 1,1 -116,0" />
        </defs>
        <text>
          <textPath href={`#seal-path-${level}`}>{text}</textPath>
        </text>
      </svg>
      <div className="verification-seal__inner" style={{ backgroundColor: config.color }}>
        <ShieldCheck size={46} color="white" strokeWidth={1.8} />
      </div>
    </div>
  );
}
