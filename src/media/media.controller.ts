import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Get,
  NotFoundException,
  Param,
  Delete,
  BadRequestException,
  Query,
  Patch,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaUsage } from '@/commons/enums/media-usage.enum';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ImageResponseDto } from './dto/image-response.dto';
import { Roles } from '@/commons/decorators/roles.decorator';
import { UpdateMediaDto } from './dto/update-media.dto';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener lista paginada de imágenes con sus formatos' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (por defecto 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Cantidad de resultados por página (por defecto 10)' })
  @ApiQuery({ name: 'usage', required: false, enum: MediaUsage, description: 'Filtro por usage' })
  @ApiResponse({ status: 200, description: 'Lista paginada de imágenes con sus formatos.' })
  @ApiResponse({ status: 400, description: 'Page y limit deben ser números.' })
  async getImagesWithPagination(@Query('page') page: string = '1', @Query('limit') limit: string = '10', @Query('usage') usage?: MediaUsage) {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      throw new Error('Page and limit must be numbers');
    }

    return this.mediaService.findAllWithFormats(pageNumber, limitNumber, usage);
  }
  @Post('upload')
  @ApiBearerAuth()
  @Roles('Admin')
  @ApiOperation({ summary: 'Subir una imagen y procesar los formatos' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo de imagen a subir y sus metadatos',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen',
        },
        usage: {
          type: 'string',
          enum: Object.values(MediaUsage),
          description: 'El propósito de la imagen (debe coincidir con el enum MediaUsage)',
        },
        description: {
          type: 'string',
          description: 'Descripción opcional de la imagen',
        },
        name: {
          type: 'string',
          description: 'Nombre que se desea dar o tomará el nombre del archivo',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Imagen subida exitosamente', type: ImageResponseDto })
  @ApiResponse({ status: 400, description: 'El valor de usage no es válido' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('usage') usage: MediaUsage,
    @Body('description') description?: string,
    @Body('name') name?: string,
  ) {
    const validUsageValues = Object.values(MediaUsage);

    if (!validUsageValues.includes(usage)) {
      throw new BadRequestException(`El valor de usage "${usage}" no es válido. Los valores permitidos son: ${validUsageValues.join(', ')}.`);
    }

    const savedMedia = await this.mediaService.uploadAndProcessImage(file, usage, description, name);

    return {
      message: 'Imagen subida exitosamente',
      media: savedMedia,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener los detalles completos de una imagen con sus formatos' })
  @ApiParam({
    name: 'id',
    description: 'El ID de la imagen a recuperar',
    example: 1,
    required: true,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Información de la imagen devuelta con éxito',
    type: ImageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Media not found',
  })
  async findOne(@Param('id') id: string) {
    const media = await this.mediaService.findOneWithFormats(+id);
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    return media;
  }
  @Patch(':id')
  @Roles('Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar los metadatos de una imagen' })
  @ApiParam({ name: 'id', description: 'ID de la imagen a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Imagen actualizada con éxito',
  })
  @ApiResponse({
    status: 404,
    description: 'Imagen no encontrada',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  async updateMedia(@Param('id') id: string, @Body() updateMediaDto: UpdateMediaDto) {
    return this.mediaService.updateMedia(+id, updateMediaDto);
  }
  @Delete(':id')
  @Roles('Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una imagen por su ID' })
  @ApiParam({
    name: 'id',
    description: 'El ID de la imagen a eliminar',
    example: 1,
    required: true,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Imagen eliminada con éxito',
  })
  @ApiResponse({
    status: 404,
    description: 'Imagen no encontrada',
  })
  async deleteImage(@Param('id') id: number) {
    return this.mediaService.deleteImage(id);
  }
}
