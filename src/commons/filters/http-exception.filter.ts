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

    // Definir el código de estado de la respuesta
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Mensaje por defecto si no es un HttpException o el mensaje es desconocido
    let message: any = 'Error interno del servidor';

    // Manejar HttpExceptions de manera personalizada
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      // Procesar el mensaje si es un array o string
      message = typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message || 'Error desconocido';
    }

    // Añadir información detallada del error solo en modo desarrollo
    const detailedError =
      this.configService.get<string>('NODE_ENV') === 'development'
        ? {
            name: exception.constructor.name,
          }
        : null;

    // Estructura de la respuesta de error
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(detailedError && { detailedError }), // Añadimos el detalle si está en desarrollo
    };

    // Enviar la respuesta solo si los headers no han sido enviados
    if (!response.headersSent) {
      response.status(status).json(errorResponse);
    }

    // Log de la excepción para seguimiento
    //console.error('Error interceptado: ', exception);
  }
}
