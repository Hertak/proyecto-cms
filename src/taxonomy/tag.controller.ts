import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Tag } from './entities/tag.entity';
import { Roles } from '@/commons/decorators/roles.decorator';

@ApiTags('Tags')
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @Roles('Usuario')
  @ApiOperation({ summary: 'Crear un nuevo tag' })
  @ApiResponse({ status: 201, description: 'El tag ha sido creado exitosamente.', type: Tag })
  @ApiResponse({ status: 400, description: 'Error en la solicitud.' })
  async create(@Body() createTagDto: CreateTagDto): Promise<Tag> {
    try {
      return await this.tagService.create(createTagDto);
    } catch (error) {
      throw new BadRequestException(`${error.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los tags con paginación' })
  @ApiQuery({ name: 'entityName', required: false, description: 'Filtrar por nombre de la entidad' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar tags por nombre' })
  @ApiQuery({ name: 'orderField', required: false, description: 'Campo por el cual ordenar', example: 'id' })
  @ApiQuery({ name: 'order', required: false, description: 'Dirección de la ordenación', example: 'ASC' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página para la paginación', type: String, example: '1' })
  @ApiQuery({ name: 'limit', required: false, description: 'Cantidad de elementos por página', type: String, example: '10' })
  @ApiResponse({ status: 200, description: 'Lista de tags con paginación', type: [Tag] })
  async findAll(
    @Query('entityName') entityName?: string,
    @Query('search') search?: string,
    @Query('orderField') orderField: string = 'id',
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<any> {
    const numericPage = parseInt(page, 10);
    const numericLimit = parseInt(limit, 10);

    if (isNaN(numericPage) || numericPage < 1) {
      throw new BadRequestException('La página debe ser un número válido mayor o igual a 1.');
    }

    if (isNaN(numericLimit) || numericLimit < 1) {
      throw new BadRequestException('El límite debe ser un número válido mayor o igual a 1.');
    }

    const result = await this.tagService.findAll(entityName, search, numericPage, numericLimit, `${orderField}:${order}`);
    if (result.data.length === 0) {
      throw new NotFoundException('No hay resultados para la búsqueda.');
    }

    return result;
  }
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tag por ID' })
  @ApiParam({ name: 'id', description: 'ID del tag' })
  @ApiResponse({ status: 200, description: 'Información del tag', type: Tag })
  @ApiResponse({ status: 404, description: 'Tag no encontrado' })
  async findOne(@Param('id') id: number): Promise<Tag> {
    return this.tagService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Actualizar un tag por ID' })
  @ApiParam({ name: 'id', description: 'ID del tag' })
  @ApiResponse({ status: 200, description: 'El tag ha sido actualizado exitosamente.', type: Tag })
  @ApiResponse({ status: 404, description: 'Tag no encontrado' })
  @ApiResponse({ status: 400, description: 'Error en la solicitud.' })
  async update(@Param('id') id: number, @Body() updateTagDto: UpdateTagDto): Promise<{ message: string; tag: Tag }> {
    try {
      const updatedTag = await this.tagService.update(id, updateTagDto);
      return { message: 'Actualizado con éxito', tag: updatedTag };
    } catch (error) {
      throw new BadRequestException(`Error en la solicitud: ${error.message}`);
    }
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Eliminar un tag por ID' })
  @ApiParam({ name: 'id', description: 'ID del tag' })
  @ApiResponse({ status: 200, description: 'El tag ha sido eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Tag no encontrado' })
  async remove(@Param('id') id: number): Promise<{ message: string }> {
    await this.tagService.remove(id);
    return { message: 'Eliminado con éxito' };
  }
}
