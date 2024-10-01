import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateMediaDto {
  @ApiProperty({
    description: 'Nombre de la imagen',
    example: 'Foto de perfil',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @ApiProperty({
    description: 'Descripción de la imagen',
    example: 'Imagen de portada para el perfil',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}
