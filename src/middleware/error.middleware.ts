import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction): void => {
  const traceId = req.headers['x-correlation-id'] || 'N/A';
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || undefined;
  const errorDetails = err.details || undefined;

  const responseBody: any = {
    error: true,
    traceId,
    message: err.message || 'Internal Server Error'
  };

  Logger.error(`[${traceId}] [ERROR] ${err.name || 'InternalError'}: ${err.message}`);

  if (errorCode) responseBody.code = errorCode;
  if (errorDetails && process.env.NODE_ENV === 'development') {
    // Future ability to send alerts via AWS CloudWatch to Slack
    Logger.error(err.stack);
    if (errorDetails) responseBody.details = errorDetails;
  }

  res.status(statusCode).json(responseBody);
};
