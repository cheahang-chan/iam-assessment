import winston from 'winston';
import { ILogger } from '../interfaces/logger.interface';

export const Logger: ILogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [new winston.transports.Console()]
});
