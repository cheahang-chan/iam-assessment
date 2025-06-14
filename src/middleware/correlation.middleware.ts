import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const CORRELATION_HEADER = 'x-correlation-id';

export const correlationMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const incomingId = req.headers[CORRELATION_HEADER] as string | undefined;
    
    const correlationId = incomingId || uuidv4();

    req.headers[CORRELATION_HEADER] = correlationId;

    res.setHeader(CORRELATION_HEADER, correlationId);

    next();
};
