import type { AuthUser, UserRole } from "@itss/shared";
import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../auth/tokens.js";
import { mapAuthUser } from "../auth/user.js";
import { prisma } from "../prisma.js";

export type AuthenticatedRequest = Request & {
  currentUser: AuthUser;
};

export async function authenticate(request: Request, response: Response, next: NextFunction) {
  const token = readBearerToken(request);

  if (!token) {
    response.status(401).json({ message: "Bạn cần đăng nhập để thực hiện thao tác này." });
    return;
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    response.status(401).json({ message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.sub
    }
  });

  if (!user || user.status !== "active") {
    response.status(401).json({ message: "Tài khoản không còn hoạt động." });
    return;
  }

  (request as AuthenticatedRequest).currentUser = mapAuthUser(user);
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (request: Request, response: Response, next: NextFunction) => {
    const user = (request as Partial<AuthenticatedRequest>).currentUser;

    if (!user) {
      response.status(401).json({ message: "Bạn cần đăng nhập để thực hiện thao tác này." });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      response.status(403).json({ message: "Tài khoản không có quyền thực hiện thao tác này." });
      return;
    }

    next();
  };
}

function readBearerToken(request: Request) {
  const header = request.header("authorization");

  if (!header?.startsWith("Bearer ")) return null;

  return header.slice("Bearer ".length).trim();
}
