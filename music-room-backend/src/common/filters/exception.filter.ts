import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorCode } from '../errors/error-codes';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Check if it's already our custom error format
      if (
        typeof exceptionResponse === 'object' &&
        'error' in exceptionResponse
      ) {
        errorResponse = exceptionResponse;
      } else {
        errorResponse = {
          error: {
            code: ErrorCode.INTERNAL_ERROR,
            message:
              typeof exceptionResponse === 'string'
                ? exceptionResponse
                : (exceptionResponse as any).message || 'An error occurred',
            statusCode,
          },
        };
      }
    } else {
      // Log unexpected errors
      this.logger.error('Unexpected error:', exception);

      errorResponse = {
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Internal server error',
          statusCode,
        },
      };
    }

    response.status(statusCode).json(errorResponse);
  }
}
