import winston from 'winston';
import { ILogger } from '../interfaces/logger.interface';
import { getCorrelationId } from './correlation-context';

/**
 * Application-wide logger using Winston.
 * - Provides timestamped, leveled logging to the console.
 */
export const Logger: ILogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
            const correlationId = getCorrelationId() || 'N/A';
            return `[${timestamp}] [correlationId=${correlationId}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [new winston.transports.Console()]
});
