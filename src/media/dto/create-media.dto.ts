import { MediaUsage } from '@/commons/enums/media-usage.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator';

export class UploadMediaDto {
  @ApiProperty({
    description: 'Contexto de uso de la imagen, es un enum porlo que solo acepta ciertos valores',
    example: 'avatar',
  })
  @IsEnum(MediaUsage)
  @IsString()
  usage: MediaUsage;

  @ApiProperty({
    description: 'Descripción opcional para la imagen',
    example: 'Esta es una imagen de perfil',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Nombre opcional para la imagen',
    example: 'Mi imagen personalizada',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsInt()
  galleryId?: number;
}