import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    description: 'Nombre del tag',
    example: 'React',
  })
  @IsString({ message: 'debe ser un string válido' })
  @IsNotEmpty({ message: 'no puede estar vacío' })
  @MaxLength(50, { message: 'debe tener entre 3 y 50 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Slug del tag para URL amigable',
    example: 'react',
  })
  @ApiProperty({
    description: 'Nombre de la entidad a la que pertenece el tag',
    example: 'article',
  })
  @IsString({ message: 'El campo "entityName" debe ser un string válido' })
  @IsNotEmpty({ message: 'El campo "entityName" no puede estar vacío' })
  entityName: string;
}
