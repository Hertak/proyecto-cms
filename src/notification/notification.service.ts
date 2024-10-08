import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_SECURE === 'true',

      ...(process.env.SMTP_USER && process.env.SMTP_PASS ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } } : {}),
    });
  }
  async sendNewUserNotification(email: string, username: string) {
    const fromName = this.configService.get<string>('MAIL_FROM_NAME');
    const fromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS');
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');

    const subject = `'Nuevo usuario registrado en ${fromName}'`;
    const htmlContent = `
      <p>Un nuevo usuario se ha registrado en ${fromName}.</p>
      <p>Nombre de usuario: ${username}</p>
      <p>Correo electrónico: ${email}</p>
    `;

    await this.transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: adminEmail,
      subject,
      html: htmlContent,
    });
  }
  async sendTestEmail(to: string) {
    const fromName = this.configService.get<string>('MAIL_FROM_NAME');
    const fromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS');

    const mailOptions = {
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject: 'Correo de prueba',
      text: 'Este es un correo de prueba enviado desde el NotificationModule',
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Correo enviado: %s', info.messageId);
    } catch (error) {
      console.error('Error al enviar el correo: ', error);
    }
  }
}
