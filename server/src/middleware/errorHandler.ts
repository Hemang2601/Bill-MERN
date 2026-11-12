import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  logger.error(
    {
      err: err.message || err,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      url: req.originalUrl,
      method: req.method,
    },
    'Unhandled request error'
  );

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}
