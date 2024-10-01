import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Role } from '@/roles/entities/role.entity';
import { Media } from '@/media/entities/media.entity';

export async function validateUniqueEmail(userRepository: Repository<User>, email: string, currentUserId?: number): Promise<void> {
  const existingUser = await userRepository.findOne({ where: { email } });
  if (existingUser && existingUser.id !== currentUserId) {
    throw new BadRequestException('El email ya está en uso');
  }
}

export async function validateUniqueUsername(userRepository: Repository<User>, username: string, currentUserId?: number): Promise<void> {
  const existingUser = await userRepository.findOne({ where: { username } });
  if (existingUser && existingUser.id !== currentUserId) {
    throw new BadRequestException('El nombre de usuario ya existe');
  }
}

export async function validateRoles(roleRepository: Repository<Role>, roles: string[]): Promise<Role[]> {
  const rolesToAssign = await roleRepository.find({ where: { name: In(roles) } });
  if (!rolesToAssign.length) {
    throw new BadRequestException('No se encontraron los roles proporcionados');
  }
  return rolesToAssign;
}

export async function validateAvatar(mediaRepository: Repository<Media>, avatarId: number): Promise<Media> {
  const avatar = await mediaRepository.findOne({ where: { id: avatarId } });
  if (!avatar) {
    throw new NotFoundException('El avatar no fue encontrado');
  }
  return avatar;
}

export function validateEmailFormat(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new BadRequestException('Formato de email inválido');
  }
}
