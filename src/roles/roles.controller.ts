import { Controller, Get, Post, Body, Param, Delete, Query, Patch, HttpCode } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '@/commons/decorators/roles.decorator';
@ApiTags('Roles')
@Controller('roles')
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  @ApiBody({ type: CreateRoleDto })
  @Roles('Admin')
  @HttpCode(201)
  async create(@Body() createRoleDto: CreateRoleDto) {
    const newRole = await this.rolesService.createRole(createRoleDto);
    return {
      message: `Rol ${newRole.name} creado con éxito`,
      role: newRole,
    };
  }

  @Get()
  @Roles('Admin')
  @ApiOperation({ summary: 'Obtener todos los roles con paginación' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad de resultados por página',
  })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNumber = page && parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const limitNumber = limit && parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;
    return this.rolesService.findAllRoles(pageNumber, limitNumber);
  }

  @Get(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Obtener un rol por su ID' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findRoleById(+id);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Actualizar un rol por su ID' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiBody({ type: CreateRoleDto })
  async update(@Param('id') id: string, @Body() updateRoleDto: CreateRoleDto) {
    const updatedRole = await this.rolesService.updateRole(+id, updateRoleDto);
    return {
      message: 'Editado con éxito',
      data: updatedRole,
    };
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Eliminar un rol por su ID' })
  @ApiParam({ name: 'id', description: 'ID del rol a eliminar' })
  async deleteRole(@Param('id') id: string) {
    await this.rolesService.deleteRole(+id);

    return {
      message: `El rol con ID ${id} ha sido borrado`,
    };
  }

  @Post(':id/permissions')
  @Roles('Admin')
  @ApiOperation({ summary: 'Asignar un permiso a un rol' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  assignPermission(@Param('id') id: string, @Body() assignPermissionDto: AssignPermissionDto) {
    return this.rolesService.assignPermission(+id, assignPermissionDto);
  }

  @Get(':id/permissions')
  @Roles('Admin')
  @ApiOperation({ summary: 'Obtener los permisos de un rol' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  getPermissions(@Param('id') id: string) {
    return this.rolesService.findPermissionsByRole(+id);
  }
}
