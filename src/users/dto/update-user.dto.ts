import { IsOptional, IsString, IsEmail, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Nombre de usuario, opcional para actualizar',
    example: 'newUsername',
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'Contraseña nueva para el usuario',
    example: 'NewPassword123',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    description: 'Correo electrónico nuevo del usuario, debe ser único',
    example: 'newemail@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'El correo debe ser un email válido' })
  email?: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'Estado activo del usuario',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  activeStatus?: boolean;

  @ApiProperty({
    description: 'Array de nombres de roles para el usuario',
    example: ['Admin', 'Usuario'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Cada rol debe ser un string válido' })
  roles?: string[];

  @ApiProperty({
    description: 'ID del avatar (imagen) relacionado con el módulo media',
    example: 5,
    required: false,
  })
  @IsOptional()
  avatarId?: number;
}
