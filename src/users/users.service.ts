import { Injectable, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '@/roles/entities/user-role.entity';
import { Role } from '@/roles/entities/role.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { Media } from '@/media/entities/media.entity';
import { MediaService } from '@/media/media.service';

import {
  validateAvatar,
  validateEmailFormat,
  validateRoles,
  validateUniqueEmail,
  validateUniqueUsername,
} from '@/commons/validations/user-validation.utils';
import { UpdateProfileDto } from './dto/update-profile.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly mediaService: MediaService,
  ) {}

  async findAll(page: number = 1, limit: number = 10, order: 'ASC' | 'DESC' = 'ASC', searchEmail?: string, searchName?: string) {
    const whereConditions = [];

    if (searchEmail) {
      validateEmailFormat(searchEmail);
      whereConditions.push({ email: Like(`%${searchEmail}%`) });
    }

    if (searchEmail) {
      whereConditions.push({ email: Like(`%${searchEmail}%`) });
    }

    if (searchName) {
      whereConditions.push({ username: Like(`%${searchName}%`) });
    }

    const [result, total] = await this.userRepository.findAndCount({
      where: whereConditions.length > 0 ? whereConditions : undefined,
      relations: ['userRoles', 'userRoles.role', 'avatar.imageFormats', 'avatar'],
      order: { id: order },
      skip: (page - 1) * limit,
      take: limit,
    });
    if (total === 0) {
      throw new NotFoundException('No hay resultados para la búsqueda');
    }
    const totalPages = Math.ceil(total / limit);

    return {
      data: result,
      total_items: total,
      total_pages: totalPages,
      current_page: page,
    };
  }
  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  async findById(userId: number, options?: { relations: string[] }): Promise<User> {
    const id = Number(userId);

    if (isNaN(id)) {
      console.error('Error: ID no válido en findById:', id);
      throw new Error('Invalid userId');
    }

    const user = await this.userRepository.findOne({
      where: { id },
      relations: options?.relations || [],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async findByUsername(username: string, options?: { relations: string[] }): Promise<User> {
    return this.userRepository.findOne({
      where: { username },
      relations: options?.relations || [],
    });
  }
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { username, email, password, firstName, lastName, activeStatus, roles, avatarId } = updateUserDto;

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    const oldAvatarId = user.avatarId ? user.avatarId : null;

    if (email && email !== user.email) {
      await validateUniqueEmail(this.userRepository, email, user.id);
      user.email = email;
    }

    if (username && username !== user.username) {
      await validateUniqueUsername(this.userRepository, username, user.id);
      user.username = username;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (activeStatus !== undefined) user.activeStatus = activeStatus;

    if (roles) {
      await this.userRoleRepository.delete({ user });

      const rolesToAssign = await validateRoles(this.roleRepository, roles);
      for (const role of rolesToAssign) {
        await this.userRoleRepository.save({ user, role });
      }
    }

    if (avatarId) {
      const avatar = await validateAvatar(this.mediaRepository, avatarId);
      user.avatar = avatar;
    }
    const updatedUser = await this.userRepository.save(user);
    if (oldAvatarId) {
      await this.mediaService.deleteImage(oldAvatarId);
    }

    return updatedUser;
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<User> {
    const { email, password, firstName, lastName, avatarId } = updateProfileDto;

    let user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'avatar', 'avatar.imageFormats'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const oldAvatar = user.avatar;

    if (email && email !== user.email) {
      await validateUniqueEmail(this.userRepository, email, user.id);
      user.email = email;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    if (avatarId) {
      const avatar = await validateAvatar(this.mediaRepository, avatarId);
      user.avatar = avatar;
    }

    const updatedUser = await this.userRepository.save(user);

    if (oldAvatar) {
      await this.mediaService.deleteImage(oldAvatar.id);
    }

    user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['avatar', 'avatar.imageFormats'],
    });

    console.log('Perfil de usuario actualizado, avatar incluido con sus formatos.');

    return user;
  }
  async getProfileData(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role', 'avatar', 'avatar.imageFormats'],
      select: ['id', 'username', 'email', 'firstName', 'lastName', 'activeStatus'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    return user;
  }
  async deleteUser(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userRoles', 'avatar'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const avatarId = user.avatar ? user.avatar.id : null;

    if (user.avatar) {
      user.avatar = null;
      await this.userRepository.save(user);
    }

    await this.userRoleRepository.delete({ user: { id: user.id } });

    if (avatarId) {
      await this.mediaService.deleteImage(avatarId);
    }

    await this.userRepository.delete(user.id);

    return { message: 'Usuario eliminado con éxito' };
  }
}
