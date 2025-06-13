import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('[Error]', err.message);
  res.status(err.statusCode || 500).json({
    error: true,
    message: err.message || 'Internal Server Error',
  });
};
