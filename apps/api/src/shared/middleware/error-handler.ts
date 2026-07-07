import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import { logger } from "../logger.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId;

  if (err instanceof AppError) {
    logger.warn(
      {
        requestId,
        statusCode: err.statusCode,
        message: err.message,
        path: req.path,
        method: req.method,
      },
      `Operational error: ${err.message}`
    );

    res.status(err.statusCode).json({
      error: err.constructor.name,
      message: err.message,
      ...(requestId && { requestId }),
    });
    return;
  }

  logger.error(
    {
      requestId,
      err,
      path: req.path,
      method: req.method,
    },
    `Unexpected error: ${err.message}`
  );

  res.status(500).json({
    error: "InternalServerError",
    message: "An error occurred, please try again later.",
    ...(requestId && { requestId }),
  });
}
