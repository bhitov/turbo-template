import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export interface ApiError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error("Error:", err);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation Error",
      details: err.errors,
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const createError = (message: string, statusCode = 500): ApiError => {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  return error;
};
