import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "./auth.service.js";
import { UnauthorizedError } from "../../shared/errors/app-error.js";
import type { TokenPayload } from "./auth.service.js";

declare global {
  namespace Express {
    interface Request {
      admin?: TokenPayload;
    }
  }
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or malformed Authorization header");
  }

  const token = header.slice(7);
  req.admin = verifyAccessToken(token);
  next();
}
