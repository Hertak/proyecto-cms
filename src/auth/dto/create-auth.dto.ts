import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre de usuario para el registro',
    example: 'testuser',
  })
  @MinLength(6, { message: 'El nombre de usuario debe tener al menos 6 caracteres' })
  @Matches(/^\S+$/, { message: 'El nombre de usuario no debe tener espacios en el medio' })
  @Transform(({ value }) => value.trim())
  @IsNotEmpty({ message: 'El nombre de usuario no puede estar vacío' })
  username: string;

  @ApiProperty({
    description: 'Contraseña del usuario, debe tener al menos 6 caracteres',
    example: 'password123',
  })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({
    description: 'Correo electrónico válido para el registro',
    example: 'testuser@example.com',
  })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío' })
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  email: string;

  @ApiProperty({
    description: 'Nombre del rol a asignar. Si no se especifica, se asignará el rol por defecto "Usuario".',
    example: 'Usuario',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El rol debe ser una cadena de texto válida' })
  role?: string;
}
