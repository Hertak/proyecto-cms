import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  Patch,
  Body,
  UploadedFile,
  UseInterceptors,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './users.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/commons/decorators/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { MediaService } from '@/media/media.service';
import { MediaUsage } from '@/commons/enums/media-usage.enum';

import { FileInterceptor } from '@nestjs/platform-express';
@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  @Roles('Admin')
  @ApiOperation({ summary: 'Endpoint para listar usuarios' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Número de usuarios por página', example: 10 })
  @ApiQuery({ name: 'order', enum: ['ASC', 'DESC'], required: false, description: 'Orden por id', example: 'ASC' })
  @ApiQuery({ name: 'email', required: false, description: 'Buscar usuarios por email', example: 'usuario@example.com' })
  @ApiQuery({ name: 'username', required: false, description: 'Buscar usuarios por nombre', example: 'Juan' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios con paginación y roles' })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
    @Query('email') email?: string,
    @Query('username') username?: string,
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.userService.findAll(pageNumber, limitNumber, order, email, username);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Para editar un único usuario por el Admin' })
  @ApiParam({ name: 'id', description: 'ID del usuario a actualizar', example: 1 })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Usuario actualizado con éxito' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUser(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() updateUserDto: UpdateUserDto) {
    let avatarId: number | null = null;

    if (file) {
      const media = await this.mediaService.uploadAndProcessImage(file, MediaUsage.AVATAR);
      avatarId = media.id;
    }

    updateUserDto.avatarId = avatarId;

    const user = await this.userService.updateUser(+id, updateUserDto);
    return {
      message: 'Usuario actualizado con éxito',
      user,
    };
  }

  @Get(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Listar 1 usuario por id' })
  @ApiParam({ name: 'id', required: true, description: 'El ID del usuario que se desea buscar', example: 1 })
  @ApiResponse({ status: 200, description: 'Detalles del usuario con sus roles' })
  @ApiResponse({ status: 404, description: 'El usuario con id {id} no fue encontrado' })
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findById(+id, { relations: ['userRoles', 'userRoles.role', 'avatar', 'avatar.imageFormats'] });
    if (!user) {
      throw new NotFoundException(`El usuario con id ${id} no se ha encontrado`);
    }
    return user;
  }
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario a eliminar', type: Number })
  @ApiResponse({ status: 200, description: 'Usuario eliminado con éxito', schema: { example: { message: 'Usuario eliminado con éxito' } } })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.userService.deleteUser(id);
    return { message: 'Usuario eliminado con éxito' };
  }
}
