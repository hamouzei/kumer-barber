export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, 403);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 422);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super(message, 429);
  }
}
