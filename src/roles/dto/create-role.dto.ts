import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Nombre del rol, debe ser único',
    example: 'admin',
  })
  @IsString({ message: 'El nombre del rol debe ser un string' })
  @IsNotEmpty({ message: 'El nombre del rol no puede estar vacío' })
  @MaxLength(50, {
    message: 'El nombre del rol no puede exceder los 50 caracteres',
  })
  readonly name: string;

  @ApiProperty({
    description: 'Descripción del rol, opcional',
    example: 'Administrador con acceso completo al sistema',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200, {
    message: 'La descripción no puede exceder los 200 caracteres',
  })
  readonly description?: string;
}
