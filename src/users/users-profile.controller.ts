import { Controller, Get, Body, Patch, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './users.service';
import { ActiveUser } from '@/commons/decorators/active-user.decorator';
import { User } from './entities/user.entity';
import { Roles } from '@/commons/decorators/roles.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';

import { MediaService } from '@/media/media.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('profile')
@ApiTags('Profile')
@ApiBearerAuth()
export class UserProfileController {
  constructor(
    private readonly userService: UserService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  @Roles('Usuario')
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario recuperado con éxito.' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getProfile(@ActiveUser() user: User) {
    return this.userService.getProfileData(user.id);
  }

  @Patch('edit')
  @Roles('Usuario')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Editar el perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado con éxito.' })
  @ApiResponse({ status: 400, description: 'Error en la actualización del perfil' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiConsumes('multipart/form-data')
  async editProfile(@ActiveUser() user: User, @Body() updateProfileDto: UpdateProfileDto, @UploadedFile() file: Express.Multer.File) {
    let avatarId: number | null = null;

    if (file) {
      const media = await this.mediaService.uploadAndProcessImage(file, 'avatar');
      avatarId = media.id;
    }

    updateProfileDto.avatarId = avatarId;

    const updatedUser = await this.userService.updateProfile(user.id, updateProfileDto);

    return {
      message: 'Perfil actualizado con éxito',
      user: updatedUser,
    };
  }
}
