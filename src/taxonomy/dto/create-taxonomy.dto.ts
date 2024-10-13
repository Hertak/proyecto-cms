import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateTaxonomyDto {
  @ApiProperty({
    description: 'El nombre de la taxonomía',
    example: 'Categoría',
  })
  @IsString({ message: 'El campo "name" es obligatorio' })
  name: string;

  @ApiProperty({
    description: 'Slug único de la taxonomía para URL amigable',
    example: 'categoria',
  })
  @IsOptional()
  @IsString({ message: 'El slug debe ser string válido' })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Descripción de la taxonomía',
    example: 'Una categoría que agrupa tipos de publicaciones',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Nombre de la entidad a la que pertenece la taxonomía',
    example: 'post',
  })
  @IsString({ message: 'Debe haber una entidad válida' })
  entityName: string;

  @ApiPropertyOptional({
    description: 'Tipo de la taxonomía',
    example: 'Category',
  })
  @IsString({ message: 'El tipo de taxonomía debe ser una cadena de texto válida' })
  @IsOptional()
  tax_type?: string;

  @ApiPropertyOptional({
    description: 'ID de la taxonomía padre, si es una sub-taxonomía',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  parentId?: number;

  @ApiPropertyOptional({
    description: 'ID de la imagen asociada a la taxonomía',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  imageId?: number;
}
