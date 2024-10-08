import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: any;
    let detailedError: any = null;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message || 'Error desconocido';
    } else {
      message = 'Error interno del servidor';
    }

    if (this.configService.get<string>('NODE_ENV') === 'development') {
      detailedError = {
        name: exception.constructor.name,
        stack: (exception as Error).stack,
      };
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(detailedError && { detailedError }),
    };

    if (!response.headersSent) {
      response.status(status).json(errorResponse);
    }

    console.error('Error capturado: ', exception);
  }
}
