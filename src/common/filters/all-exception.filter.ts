import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Внутренняя ошибка сервера';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = this.extractMessage(exception);
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Сущность не найдена';
    } else if (exception instanceof QueryFailedError) {
      const driverError = exception.driverError as { code?: string };
      if (driverError?.code === '23505') {
        status = HttpStatus.CONFLICT;
        message = 'Запись уже существует';
      }
    }

    response.status(status).json({
      error: {
        status,
        message,
        method: request.method,
        url: request.url,
      },
    });
  }

  private extractMessage(exception: HttpException): string | string[] {
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const { message } = exceptionResponse as { message?: string | string[] };
      if (message !== undefined) {
        return message;
      }
    }

    return exception.message;
  }
}
