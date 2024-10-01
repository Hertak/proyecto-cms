import { ApiProperty } from '@nestjs/swagger';

export class ImageFormatsResponseDto {
    @ApiProperty({ example: 13, description: 'ID del formato de imagen' })
    id: number;

    @ApiProperty({ example: 'large', description: 'Nombre del formato de imagen' })
    format: string;

    @ApiProperty({ example: 1024, description: 'Ancho del formato de imagen' })
    width: number;

    @ApiProperty({ example: 683, description: 'Altura del formato de imagen' })
    height: number;

    @ApiProperty({ example: 140406, description: 'Tamaño del formato de imagen en bytes' })
    size: number;

    @ApiProperty({ example: 'uploads\\city\\2024\\09\\large-ce9e83d5-5550-4fb5-91a9-ff60f43021b4.jpg', description: 'URL del formato de imagen' })
    url: string;
}