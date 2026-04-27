import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes';

export class AppError extends HttpException {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super(
      {
        error: {
          code,
          message,
          statusCode,
        },
      },
      statusCode,
    );
  }

  static roomNotFound(roomCode?: string): AppError {
    return new AppError(
      ErrorCode.ROOM_NOT_FOUND,
      roomCode ? `Room ${roomCode} not found` : 'Room not found',
      HttpStatus.NOT_FOUND,
    );
  }

  static roomEnded(): AppError {
    return new AppError(
      ErrorCode.ROOM_ENDED,
      'Room has ended',
      HttpStatus.GONE,
    );
  }

  static invalidHostSecret(): AppError {
    return new AppError(
      ErrorCode.INVALID_HOST_SECRET,
      'Invalid host secret',
      HttpStatus.UNAUTHORIZED,
    );
  }

  static hostSecretRequired(): AppError {
    return new AppError(
      ErrorCode.HOST_SECRET_REQUIRED,
      'Host secret is required',
      HttpStatus.BAD_REQUEST,
    );
  }

  static userNotFound(userId?: string): AppError {
    return new AppError(
      ErrorCode.USER_NOT_FOUND,
      userId ? `User ${userId} not found` : 'User not found',
      HttpStatus.NOT_FOUND,
    );
  }

  static validationError(message: string): AppError {
    return new AppError(
      ErrorCode.VALIDATION_ERROR,
      message,
      HttpStatus.BAD_REQUEST,
    );
  }

  static livekitTokenError(message: string): AppError {
    return new AppError(
      ErrorCode.LIVEKIT_TOKEN_ERROR,
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  static rateLimited(): AppError {
    return new AppError(
      ErrorCode.RATE_LIMITED,
      'Too many requests',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  static internalError(message = 'Internal server error'): AppError {
    return new AppError(
      ErrorCode.INTERNAL_ERROR,
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
