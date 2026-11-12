import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    manager?: {
      id: string;
      username: 'hiren' | 'suresh';
      displayName: string;
      signatureImage: string;
      role: 'manager';
    };
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session || !req.session.manager) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in with an authorized manager account.',
    });
    return;
  }
  next();
}

export function getCurrentManager(req: Request) {
  return req.session.manager;
}
