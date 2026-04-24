import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'object') {
        const errObj = errorResponse as { message?: string };
        message = errObj.message ?? exception.message;
        error = exception.constructor.name;
      } else {
        message = errorResponse;
        error = exception.constructor.name;
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'DatabaseError';

      const dbError = exception as QueryFailedError & { code: string };
      if (dbError.code === '23505') {
        status = HttpStatus.CONFLICT;
        message = 'Resource already exists with this unique field';
        error = 'ConflictError';
      } else if (dbError.code === '23503') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Foreign key constraint violation';
        error = 'ForeignKeyError';
      } else if (dbError.code === '23502') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Required field cannot be null';
        error = 'NotNullError';
      } else {
        message =
          process.env.NODE_ENV === 'production'
            ? 'Database operation failed'
            : `Database operation failed: ${exception.message}`;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'InternalServerError';

      this.logger.error(
        `Unexpected error: ${String(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const baseErrorResponse = {
      statusCode: status,
      message,
    };

    const errorResponse =
      process.env.NODE_ENV === 'production'
        ? baseErrorResponse
        : {
            ...baseErrorResponse,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
          };

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
    );

    response.status(status).json(errorResponse);
  }
}
