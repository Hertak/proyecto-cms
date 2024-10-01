import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
    @ApiProperty({ example: 'testuser1', description: 'Nombre de usuario registrado' })
    username: string;

    @ApiProperty({ example: 'testuser1@example.com', description: 'Correo electrónico del usuario registrado' })
    email: string;

    @ApiProperty({ description: 'Contraseña cifrada del usuario' })
    password: string;

    @ApiProperty({ description: 'Rol del usuario' })
    role: string;

    @ApiProperty({ description: 'ID del usuario' })
    id: number;
}

export class RegisterResponseDto {
    @ApiProperty({ description: 'Token de acceso JWT' })
    access_token: string;

    @ApiProperty({ description: 'Token de refresco JWT' })
    refresh_token: string;

    @ApiProperty({ type: UserDto, description: 'Información del usuario registrado' })
    user: UserDto;
}