import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyTaxonomyDto {
  @ApiProperty({ description: 'ID de la compañía a la que se asociará la taxonomía' })
  @IsNumber()
  companyId: number;

  @ApiProperty({ description: 'ID de la taxonomía que se asociará con la compañía', required: false })
  @IsOptional()
  @IsNumber()
  taxonomyId?: number;

  @ApiProperty({ description: 'Nombre de la taxonomía', required: false })
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Descripción de la taxonomía', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ID del padre de la taxonomía', required: false })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({ description: 'ID de la imagen asociada a la taxonomía', required: false })
  @IsOptional()
  @IsNumber()
  imageId?: number;
}
