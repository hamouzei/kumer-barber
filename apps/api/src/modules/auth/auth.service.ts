import jwt, { type SignOptions } from "jsonwebtoken";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { adminUsers } from "../../db/schema/index.js";
import { env } from "../../config/env.js";
import { UnauthorizedError } from "../../shared/errors/app-error.js";
import type { LoginDto } from "./auth.dto.js";

export interface TokenPayload {
  adminId: number;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: env.JWT_ACCESS_EXPIRY as SignOptions["expiresIn"],
    issuer: "barber-api",
    subject: String(payload.adminId),
  });
}

function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign({ adminId: payload.adminId }, env.JWT_PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: env.JWT_REFRESH_EXPIRY as SignOptions["expiresIn"],
    issuer: "barber-api",
    subject: String(payload.adminId),
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_PUBLIC_KEY, {
      algorithms: ["RS256"],
      issuer: "barber-api",
    }) as jwt.JwtPayload & TokenPayload;

    return { adminId: decoded.adminId, email: decoded.email };
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }
}

export function verifyRefreshToken(token: string): { adminId: number } {
  try {
    const decoded = jwt.verify(token, env.JWT_PUBLIC_KEY, {
      algorithms: ["RS256"],
      issuer: "barber-api",
    }) as jwt.JwtPayload & { adminId: number };

    return { adminId: decoded.adminId };
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
}

export async function login(dto: LoginDto): Promise<AuthTokens> {
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, dto.email))
    .limit(1);

  if (!admin) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isValid = await argon2.verify(admin.passwordHash, dto.password);

  if (!isValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const payload: TokenPayload = {
    adminId: admin.adminId,
    email: admin.email,
  };

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function refreshTokens(
  currentRefreshToken: string
): Promise<AuthTokens> {
  const { adminId } = verifyRefreshToken(currentRefreshToken);

  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.adminId, adminId))
    .limit(1);

  if (!admin) {
    throw new UnauthorizedError("Admin account not found");
  }

  const payload: TokenPayload = {
    adminId: admin.adminId,
    email: admin.email,
  };

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}
