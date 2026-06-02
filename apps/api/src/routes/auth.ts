import type { AuthResponse, MeResponse, UserRole } from "@itss/shared";
import { Router, type NextFunction, type Request, type Response } from "express";
import { hashPassword, verifyPassword } from "../auth/password.js";
import { createAccessToken } from "../auth/tokens.js";
import { mapAuthUser } from "../auth/user.js";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth.js";
import { prisma } from "../prisma.js";

const router = Router();
const roleValues = ["student", "reviewer", "admin"] as const satisfies readonly UserRole[];

router.post(
  "/register",
  asyncHandler(async (request, response) => {
    const payload = parseRegisterBody(request.body);

    if (!payload) {
      response.status(400).json({ message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu hợp lệ." });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: payload.email
      },
      select: {
        id: true
      }
    });

    if (existingUser) {
      response.status(409).json({ message: "Email này đã được đăng ký." });
      return;
    }

    const user = await prisma.user.create({
      data: {
        email: payload.email,
        passwordHash: await hashPassword(payload.password),
        fullName: payload.fullName,
        studentCode: payload.studentCode,
        role: payload.role
      }
    });
    const authUser = mapAuthUser(user);
    const result: AuthResponse = {
      user: authUser,
      accessToken: createAccessToken(authUser)
    };

    response.status(201).json(result);
  })
);

router.post(
  "/login",
  asyncHandler(async (request, response) => {
    const email = readString(request.body?.email).toLowerCase();
    const password = readString(request.body?.password);

    if (!isEmail(email) || !password) {
      response.status(400).json({ message: "Email hoặc mật khẩu không hợp lệ." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      response.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
      return;
    }

    if (user.status !== "active") {
      response.status(403).json({ message: "Tài khoản đang bị khóa." });
      return;
    }

    const authUser = mapAuthUser(user);
    const result: AuthResponse = {
      user: authUser,
      accessToken: createAccessToken(authUser)
    };

    response.status(200).json(result);
  })
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (request, response) => {
    const result: MeResponse = {
      user: (request as AuthenticatedRequest).currentUser
    };

    response.status(200).json(result);
  })
);

router.post("/logout", (_request, response) => {
  response.status(200).json({ message: "Đã đăng xuất." });
});

function parseRegisterBody(body: unknown) {
  const source = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const email = readString(source.email).toLowerCase();
  const password = readString(source.password);
  const fullName = readString(source.fullName);
  const studentCode = readOptionalString(source.studentCode);
  const role = readRegisterRole(source.role);

  if (!isEmail(email) || password.length < 8 || fullName.length < 2) return null;

  return {
    email,
    password,
    fullName,
    studentCode,
    role
  };
}

function readRegisterRole(value: unknown): UserRole {
  if (process.env.ALLOW_DEMO_ROLE_REGISTRATION !== "true") return "student";

  const text = readString(value);

  return roleValues.includes(text as UserRole) ? (text as UserRole) : "student";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(value: unknown) {
  const text = readString(value);

  return text.length > 0 ? text : null;
}

function asyncHandler(
  handler: (request: Request, response: Response, next: NextFunction) => Promise<void>
) {
  return (request: Request, response: Response, next: NextFunction) => {
    handler(request, response, next).catch(next);
  };
}

export { router as authRouter };
