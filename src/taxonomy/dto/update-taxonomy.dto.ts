import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateTaxonomyDto {
  @ApiPropertyOptional({
    description: 'El nombre de la taxonomía',
    example: 'Categoría Actualizada',
  })
  @IsOptional()
  @IsString({ message: 'El campo "name" debe ser un string válido' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Slug único de la taxonomía para URL amigable',
    example: 'categoria-actualizada',
  })
  @IsOptional()
  @IsString({ message: 'El slug debe ser un string válido' })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Descripción de la taxonomía',
    example: 'Descripción actualizada de la categoría',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Nombre de la entidad a la que pertenece la taxonomía',
    example: 'post',
  })
  @IsOptional()
  @IsString({ message: 'Debe haber una entidad válida' })
  entityName?: string;

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
