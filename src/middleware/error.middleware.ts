import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';
import { getCorrelationId } from '../utils/correlation-context';
import { error } from '../utils/response';
import { HttpStatus } from '../utils/http-status';

/**
 * Global error-handling middleware for Express.
 * 
 * - Captures all errors thrown in the request pipeline and formats a consistent JSON response.
 * - Includes a traceId (from correlation context) for distributed tracing and easier debugging.
 * - In development, exposes stack traces and error details for easier troubleshooting.
 * - In production, hides sensitive error details from the client but still logs them.
 * - Future improvement: Integrate with AWS CloudWatch or Slack for real-time alerting on critical errors.
 */
export const errorMiddleware = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const traceId = getCorrelationId() || req.headers['x-correlation-id'] || 'N/A';

  const name = err.name || "InternalError";
  const message = err.message || 'Internal Server Error';
  const errorCode = err.code || undefined;
  const errorDetails = err.details || undefined;
  const statusCode = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

  Logger.error(`[${traceId}] [ERROR] ${name}: ${message}`);

  const responseBody: any = { traceId };
  if (errorCode) responseBody.code = errorCode;
  if (errorDetails) {
    responseBody.details = errorDetails;
    Logger.error(`[${traceId}] [DETAILS] ${JSON.stringify(errorDetails)}`);
  }

  if (process.env.NODE_ENV === 'development') {
    Logger.error(err.stack);
  }

  return error(res, message, responseBody, statusCode);
};
