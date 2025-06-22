export class AppError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: any;

  constructor(message: string, statusCode = 500, code?: string, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 404, 'NOT_FOUND', details);
  }
}
