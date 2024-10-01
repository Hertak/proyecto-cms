import { Controller, Post, Body, ValidationPipe, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-auth.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterResponseDto } from './dto/register-response.dto';

@ApiTags('Autentificación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    status: 200,
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
}
