import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: any;
    if (exception instanceof UnauthorizedException) {
      message = 'Acceso denegado: Debes proporcionar un usuario válido.';
    } else if (exception instanceof HttpException) {
      message = exception.getResponse();
    } else {
      message = 'Error interno del servidor';
    }

    if (!response.headersSent) {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,
      });
    }
    if (!response.headersSent) {
      response.status(429).json({
        statusCode: 429,
        message: 'Has excedido el número de intentos. Por favor, intenta de nuevo más tarde.',
      });
    }

    console.error('Error capturado: ', exception);
  }
}
