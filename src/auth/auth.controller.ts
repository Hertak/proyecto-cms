import { Controller, Post, Body, ValidationPipe, Query, UnauthorizedException, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-auth.dto';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterResponseDto } from './dto/register-response.dto';
import { UserService } from '@/users/users.service';
import { UserNotificationService } from '@/notification/user-notification.service';

@ApiTags('Autentificación')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly userNotificationService: UserNotificationService,
  ) {}

  @ApiResponse({
    status: 201,
    description: 'Información de la respuesta',
    type: RegisterResponseDto,
  })
  @ApiOperation({
    summary: 'Registro de usuarios',
    description: 'Con este endpoint se pueden registrar usuarios',
  })
  @Post('register')
  async register(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'iniciar sesión',
    description: 'Con este endpoint se puede iniciar sesión',
  })
  async login(@Body(new ValidationPipe()) loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh Token',
    description: 'Ruta para renovar el token',
  })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
  @Post('request-password-reset')
  @ApiOperation({ summary: 'Solicitar el restablecimiento de contraseña' })
  @ApiBody({
    description: 'Correo electrónico del usuario para enviar el enlace de restablecimiento de contraseña',
    schema: { example: { email: 'user@example.com' } },
  })
  @ApiResponse({ status: 200, description: 'Correo de recuperación enviado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async requestPasswordReset(@Body('email') email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const resetToken = this.authService.generateResetToken(user.id);

    await this.userNotificationService.sendPasswordResetEmail(email, resetToken);

    return { message: 'Correo de recuperación enviado' };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer la contraseña utilizando el token de recuperación' })
  @ApiQuery({ name: 'token', description: 'Token JWT enviado en el enlace de recuperación de contraseña' })
  @ApiBody({ description: 'Nueva contraseña que se desea establecer', schema: { example: { newPassword: 'NewSecurePassword123' } } })
  @ApiResponse({ status: 200, description: 'Contraseña restablecida exitosamente.' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado.' })
  async resetPassword(@Query('token') token: string, @Body('newPassword') newPassword: string) {
    try {
      const payload = await this.authService.verifyResetToken(token);
      await this.authService.resetPassword(payload.id, newPassword);
      return { message: 'Contraseña restablecida exitosamente' };
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
