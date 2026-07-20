import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod/v4";

type ValidationTarget = "body" | "query" | "params";

export function validate(schema: ZodType, target: ValidationTarget = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      res.status(422).json({
        error: "ValidationError",
        message: "Request validation failed",
        details: errors,
      });
      return;
    }

    // Express 5 makes req.query and req.params read-only getters.
    // For "body" we can assign directly. For "query" and "params"
    // we store the validated data on a custom property instead.
    if (target === "body") {
      req.body = result.data;
    } else {
      ((req as unknown) as Record<string, unknown>)[`validated_${target}`] = result.data;
    }
    next();
  };
}
