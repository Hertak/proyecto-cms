import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';
import { CreateTaxonomyDto } from './dto/create-taxonomy.dto';
import { UpdateTaxonomyDto } from './dto/update-taxonomy.dto';
import { ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Taxonomy } from './entities/taxonomy.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from '@/media/media.service';
import { Roles } from '@/commons/decorators/roles.decorator';

@ApiTags('Taxonomy')
@Controller('taxonomy')
export class TaxonomyController {
  constructor(
    private readonly taxonomyService: TaxonomyService,
    private readonly mediaService: MediaService,
  ) {}

  @Post()
  @Roles('Admin')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Crear una nueva taxonomía con una imagen' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'La taxonomía ha sido creada exitosamente.', type: Taxonomy })
  @ApiResponse({ status: 400, description: 'Error en la solicitud.' })
  async create(@Body() createTaxonomyDto: CreateTaxonomyDto, @UploadedFile() image: Express.Multer.File): Promise<Taxonomy> {
    try {
      let savedMedia = null;

      if (image) {
        savedMedia = await this.mediaService.uploadAndProcessImage(image, createTaxonomyDto.entityName);
      }

      return await this.taxonomyService.create(createTaxonomyDto, savedMedia);
    } catch (error) {
      throw new BadRequestException(`Error en la solicitud: ${error.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las taxonomías' })
  @ApiQuery({ name: 'entityName', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'parentId', required: false, type: Number })
  @ApiQuery({ name: 'orderBy', required: false, description: 'Ordenar por campo (e.g. name:ASC o name:DESC)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('entityName') entityName?: string,
    @Query('name') name?: string,
    @Query('parentId') parentId?: number,
    @Query('orderField') orderField: string = 'id',
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<Taxonomy[]> {
    const numericPage = parseInt(page, 10);
    const numericLimit = parseInt(limit, 10);

    if (isNaN(numericPage) || numericPage < 1) {
      throw new BadRequestException('La página debe ser un número válido mayor o igual a 1.');
    }

    if (isNaN(numericLimit) || numericLimit < 1) {
      throw new BadRequestException('El límite debe ser un número válido mayor o igual a 1.');
    }
    return this.taxonomyService.findAll(entityName, name, parentId, orderField, order, numericPage, numericLimit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una taxonomía por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la taxonomía' })
  async findOne(@Param('id') id: number): Promise<Taxonomy> {
    return this.taxonomyService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Actualizar una taxonomía por ID, incluyendo la imagen' })
  @ApiParam({ name: 'id', description: 'ID de la taxonomía' })
  @ApiResponse({ status: 200, description: 'La taxonomía ha sido actualizada exitosamente, incluyendo la imagen si se provee.', type: Taxonomy })
  @ApiResponse({ status: 404, description: 'Taxonomía no encontrada' })
  @ApiResponse({ status: 400, description: 'Error en la solicitud.' })
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: number,
    @Body() updateTaxonomyDto: UpdateTaxonomyDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<{ message: string; taxonomy: Taxonomy }> {
    const updatedTaxonomy = await this.taxonomyService.update(id, updateTaxonomyDto, image);
    return {
      message: 'Actualizado con éxito',
      taxonomy: updatedTaxonomy,
    };
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Eliminar una taxonomía por ID' })
  @ApiParam({ name: 'id', description: 'ID de la taxonomía' })
  @ApiResponse({ status: 200, description: 'La taxonomía ha sido eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Taxonomía no encontrada' })
  async remove(@Param('id') id: number): Promise<{ message: string; taxonomy: Taxonomy }> {
    const deletedTaxonomy = await this.taxonomyService.findOne(id);
    await this.taxonomyService.remove(id);
    return {
      message: 'Taxonomía eliminada con éxito',
      taxonomy: deletedTaxonomy,
    };
  }
}
