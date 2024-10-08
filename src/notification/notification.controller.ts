import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Endpoint para enviar un correo de prueba
  @Get('send-test-email')
  async sendTestEmail() {
    const testEmail = 'test@example.com'; // Puedes cambiar esta dirección si quieres
    await this.notificationService.sendTestEmail(testEmail);
    return 'Correo enviado';
  }
}
