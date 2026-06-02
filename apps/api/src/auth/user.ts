import type { AuthUser } from "@itss/shared";
import type { User } from "@prisma/client";

export function mapAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    studentCode: user.studentCode,
    institutionId: user.institutionId,
    majorId: user.majorId,
    role: user.role
  };
}
