import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaxonomyDto {
  @ApiProperty({
    description: 'Nombre de la taxonomía',
    example: 'Productos',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Slug de la taxonomía (identificador único para URL)',
    example: 'productos',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({
    description: 'Descripción de la taxonomía',
    example: 'Una categoría para clasificar productos',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Nombre de la entidad o módulo al que pertenece la taxonomía',
    example: 'products',
  })
  @IsString()
  @IsNotEmpty()
  entityName: string;

  @ApiPropertyOptional({
    description: 'ID de la taxonomía padre, si es jerárquica',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiPropertyOptional({
    description: 'ID de la imagen asociada (del módulo de media)',
    example: 42,
  })
  @IsOptional()
  @IsNumber()
  imageId?: number;
}
