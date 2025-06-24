import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runWithCorrelationId } from '../utils/correlation-context';

const CORRELATION_HEADER = 'x-correlation-id';

/**
 * Correlation Middleware
 * 
 * Ensures every incoming HTTP request has a unique correlation ID for traceability.
 * - Checks for an existing 'x-correlation-id' header in the request.
 * - If present, uses the incoming correlation ID; otherwise, generates a new UUID.
 * - Attaches the correlation ID to both the request headers and the response headers.
 * - Sets up AsyncLocalStorage context for correlation ID propagation.
 * 
 * This enables end-to-end request tracking across distributed systems and simplifies debugging/logging.
 */

export const correlationMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const incomingId = req.headers[CORRELATION_HEADER] as string | undefined;
    
    const correlationId = incomingId || uuidv4();

    req.headers[CORRELATION_HEADER] = correlationId;

    res.setHeader(CORRELATION_HEADER, correlationId);

    // Wrap the request lifecycle in AsyncLocalStorage context
    runWithCorrelationId(correlationId, () => {
        next();
    });
};
