import type { Request, Response } from "express";
import * as authService from "./auth.service.js";
import type { LoginDto } from "./auth.dto.js";
import { env } from "../../config/env.js";
import { UnauthorizedError } from "../../shared/errors/app-error.js";

const REFRESH_COOKIE = "refresh_token";

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/v1/admin",
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/v1/admin",
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const dto = req.body as LoginDto;
  const tokens = await authService.login(dto);

  setRefreshCookie(res, tokens.refreshToken);

  res.status(200).json({
    token: tokens.accessToken,
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const currentRefreshToken = req.cookies?.[REFRESH_COOKIE] as
    | string
    | undefined;

  if (!currentRefreshToken) {
    throw new UnauthorizedError("No refresh token provided");
  }

  const tokens = await authService.refreshTokens(currentRefreshToken);

  setRefreshCookie(res, tokens.refreshToken);

  res.status(200).json({
    token: tokens.accessToken,
  });
}

export async function logout(
  _req: Request,
  res: Response
): Promise<void> {
  clearRefreshCookie(res);
  res.status(200).json({ message: "Logged out successfully" });
}
