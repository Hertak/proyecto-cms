import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UserNotificationService {
  private transporter: nodemailer.Transporter;
  private fromName: string;
  private fromAddress: string;
  private adminEmail: string;

  constructor(private configService: ConfigService) {
    this.fromName = this.configService.get<string>('MAIL_FROM_NAME');
    this.fromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS');
    this.adminEmail = this.configService.get<string>('ADMIN_EMAIL');

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_SECURE === 'true',

      ...(process.env.SMTP_USER && process.env.SMTP_PASS ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } } : {}),
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const appLink = `${process.env.APP_URL}?token=${token}`;

    await this.transporter.sendMail({
      from: `"${this.fromName}" <${this.fromAddress}>`,
      to: email,
      subject: `Restablecimiento de contraseña ${this.fromName}`,
      html: `
          <p>Estás intentando recuperar tu contraseña.</p>
          <br />
          <p>Para hacerlo, hacé click: <a href="${appLink}">Acá</a> e ingresá tu nueva contraseña</p>
        `,
    });
  }

  async sendWelcomeEmail(email: string, username: string) {
    const subject = `¡Bienvenido a ${this.fromName}!`;
    const htmlContent = `
      <p>Hola ${username},</p>
      <p>¡Gracias por registrarte en ${this.fromName}! Estamos emocionados de que te unas a nuestra comunidad.</p>
      <p>Si tenés alguna pregunta o necesitás asistencia, no dudés en contactarnos.</p>
      <br />
      <p>Saludos,</p>
      <p>El equipo de ${this.fromName}</p>
    `;

    await this.transporter.sendMail({
      from: `"${this.fromName}" <${this.fromAddress}>`,
      to: email,
      subject,
      html: htmlContent,
    });
  }
}
