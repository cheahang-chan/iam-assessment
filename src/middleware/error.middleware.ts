import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction): void => {
  const traceId = req.headers['x-correlation-id'] || 'N/A';
  const statusCode = err.statusCode || 500;

  Logger.error(`[${traceId}] [ERROR] ${err.name || 'InternalError'}: ${err.message}`);

  if (process.env.NODE_ENV === 'development') {
    Logger.error(err.stack);
  }

  res.status(statusCode).json({
    error: true,
    traceId,
    message: err.message || 'Internal Server Error'
  });
};
