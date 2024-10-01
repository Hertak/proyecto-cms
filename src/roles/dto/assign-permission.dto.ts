import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AssignPermissionDto {
  @ApiProperty({
    description: 'Acción permitida por este permiso (ej: CREATE, EDIT, DELETE)',
    example: 'CREATE',
  })
  @IsNotEmpty()
  @IsString()
  action: string;

  @ApiProperty({
    description:
      'Recurso sobre el cual se aplica el permiso (ej: PROFILE, GALLERY)',
    example: 'PROFILE',
  })
  @IsNotEmpty()
  @IsString()
  resource: string;

  @ApiProperty({
    description: 'Descripción del permiso, para mayor claridad',
    example: 'Permite crear un perfil',
  })
  @IsNotEmpty()
  @IsString()
  description: string;
}
