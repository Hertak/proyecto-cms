import { ImageFormatsResponseDto } from '@/image_formats/dto/image-formats-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ImageResponseDto {
  @ApiProperty({ example: 1, description: 'ID de la imagen' })
  id: number;

  @ApiProperty({ example: 'imagen.jpg', description: 'Nombre de la imagen' })
  name: string;

  @ApiProperty({ example: 'abcd1234-5678-90ef-ghij-klmnopqrstuv.jpg', description: 'Nombre del archivo almacenado' })
  storedFileName: string;

  @ApiProperty({ example: 'image/png', description: 'MIME type de la imagen' })
  mime: string;

  @ApiProperty({ example: 'Imagen de la ciudad', description: 'Descripción de la imagen', nullable: true })
  description: string | null;

  @ApiProperty({ example: 200000, description: 'Tamaño de la imagen en bytes' })
  size: number;

  @ApiProperty({ example: 1920, description: 'Ancho de la imagen' })
  width: number;

  @ApiProperty({ example: 1080, description: 'Altura de la imagen' })
  height: number;

  @ApiProperty({ example: 'uploads/module/year/month/abcd1234-5678-90ef-ghij-klmnopqrstuv.jpg', description: 'URL de la imagen' })
  url: string;

  @ApiProperty({ example: 'module', description: 'Uso asignado de la imagen (p.ej., banner, avatar, city, service, etc...)' })
  usage: string;

  @ApiProperty({ example: '2024-09-01T12:00:00.000Z', description: 'Fecha de creación de la imagen' })
  createdAt: string;

  @ApiProperty({ example: '2024-09-01T12:00:00.000Z', description: 'Fecha de actualización de la imagen' })
  updatedAt: string;

  @ApiProperty({ type: [ImageFormatsResponseDto], description: 'Lista de formatos de la imagen' })
  imageFormats: ImageFormatsResponseDto[];
}
