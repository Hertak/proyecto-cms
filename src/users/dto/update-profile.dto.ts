import { IsOptional, IsString, IsEmail, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateProfileDto {
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
