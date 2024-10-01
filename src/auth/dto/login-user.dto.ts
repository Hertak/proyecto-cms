import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: 'Nombre de usuario para iniciar sesión',
    example: 'testuser',
  })
  @IsNotEmpty({ message: 'El nombre de usuario no puede estar vacío' })
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto válida' })
  username: string;

  @ApiProperty({
    description: 'Contraseña del usuario para iniciar sesión',
    example: 'password123',
  })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto válida' })
  password: string;
}
