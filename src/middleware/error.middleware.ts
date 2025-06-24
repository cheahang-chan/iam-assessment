import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';
import { getCorrelationId } from '../utils/correlation-context';

/**
 * Global error-handling middleware for Express.
 * 
 * - Captures all errors thrown in the request pipeline and formats a consistent JSON response.
 * - Includes a traceId (from correlation context) for distributed tracing and easier debugging.
 * - In development, exposes stack traces and error details for easier troubleshooting.
 * - In production, hides sensitive error details from the client but still logs them.
 * - Future improvement: Integrate with AWS CloudWatch or Slack for real-time alerting on critical errors.
 */
export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction): void => {
  const traceId = getCorrelationId() || req.headers['x-correlation-id'] || 'N/A';
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || undefined;
  const errorDetails = err.details || undefined;

  const responseBody: any = {
    error: true,
    traceId,
    message: err.message || 'Internal Server Error'
  };

  // Log error with traceId for correlation
  Logger.error(`[${traceId}] [ERROR] ${err.name || 'InternalError'}: ${err.message}`);

  if (errorCode) responseBody.code = errorCode;
  if (process.env.NODE_ENV === 'development') {
    Logger.error(err.stack);
    if (errorDetails) responseBody.details = errorDetails;
  }
  
  // Always log error details if present, but only expose to client in development
  if (errorDetails) {
    Logger.error(`[${traceId}] [DETAILS] ${JSON.stringify(errorDetails)}`);
  }

  res.status(statusCode).json(responseBody);
};
