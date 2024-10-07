import { IsString, IsOptional, IsBoolean, IsNumber, IsNotEmpty, MaxLength, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateCompanyDto {
  @ApiProperty({ description: 'Nombre de la empresa' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Slug para url amigables' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ description: 'Descripción de los servicios ofrecidos' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Número de WhatsApp para contacto' })
  @IsString()
  whatsapp: string;

  @ApiProperty({ description: 'URL del perfil de Facebook', required: false })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiProperty({ description: 'URL del perfil de Instagram', required: false })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiProperty({ description: 'ID del logotipo de la empresa', required: false })
  @IsOptional()
  @IsNumber()
  logoId?: number;

  @ApiProperty({ description: 'ID de la imagen de portada de la empresa', required: false })
  @IsOptional()
  @IsNumber()
  coverId?: number;

  @ApiProperty({ description: 'Estado de la empresa, si está activa o no', default: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'isActive debe ser un Boleano' })
  isActive?: boolean;

  @ApiProperty({ description: 'Indica si la empresa ofrece servicio 24/7', default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'isActive debe ser un Boleano' })
  offersFullDayService?: boolean;

  @ApiProperty({ description: 'IDs de las categorías de taxonomía', required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : [Number(value)]))
  @IsNumber({}, { each: true, message: 'Cada valor en taxonomyIds debe ser un número.' })
  taxonomyIds?: number[];
}
