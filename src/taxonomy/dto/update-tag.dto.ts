import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateTagDto {
  @ApiProperty({
    description: 'Nombre del tag',
    example: 'React',
    required: false,
  })
  @IsString({ message: 'El campo "name" debe ser un string válido' })
  @IsOptional()
  @MaxLength(50, { message: 'El campo "name" no puede tener más de 50 caracteres' })
  name?: string;

  @ApiProperty({
    description: 'Nombre de la entidad a la que pertenece el tag',
    example: 'article',
    required: false,
  })
  @IsString({ message: 'El campo "entityName" debe ser un string válido' })
  @IsOptional()
  entityName?: string;
}
