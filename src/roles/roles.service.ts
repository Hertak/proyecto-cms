import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { Permission } from './entities/permission.entity';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { UserRole } from './entities/user-role.entity';
import { User } from '@/users/entities/user.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new BadRequestException('El rol con este nombre ya existe');
    }

    const role = this.roleRepository.create(createRoleDto);

    try {
      return await this.roleRepository.save(role);
    } catch (error) {
      throw new BadRequestException('Error al crear el rol. Verifique los datos e intente nuevamente');
    }
  }

  async findAllRoles(page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;

      const [roles, totalItems] = await this.roleRepository.findAndCount({
        skip,
        take: limit,
        order: { id: 'ASC' },
      });

      if (roles.length === 0) {
        throw new NotFoundException('No hay roles disponibles. Por favor, crea al menos uno.');
      }

      const totalPages = Math.ceil(totalItems / limit);

      return {
        data: roles,
        total_items: totalItems,
        total_pages: totalPages,
        current_page: page,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los roles. Intente nuevamente más tarde.');
    }
  }

  async findRoleById(roleId: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`El rol con ID ${roleId} no fue encontrado`);
    }

    return role;
  }

  async updateRole(id: number, createRoleDto: CreateRoleDto): Promise<Role> {
    await this.findRoleById(id);
    await this.roleRepository.update(id, createRoleDto);
    return this.findRoleById(id);
  }

  async deleteRole(id: number): Promise<void> {
    const role = await this.findRoleById(id);

    const userRoles = await this.userRoleRepository.find({ where: { role: { id } } });

    if (userRoles.length > 0) {
      throw new BadRequestException('No se puede eliminar el rol porque está asignado a uno o más usuarios');
    }

    const permissions = role.permissions;

    await this.roleRepository.remove(role);

    for (const permission of permissions) {
      const permissionRoles = await this.permissionRepository
        .createQueryBuilder('permission')
        .leftJoinAndSelect('permission.roles', 'roles')
        .where('permission.id = :permissionId', { permissionId: permission.id })
        .getOne();

      if (permissionRoles?.roles.length === 0) {
        await this.permissionRepository.remove(permission);
      }
    }
  }

  async findRoleByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { name } });

    if (!role) {
      throw new NotFoundException(`El rol con el nombre ${name} no fue encontrado`);
    }

    return role;
  }
  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    const existingUserRole = await this.userRoleRepository.findOne({
      where: { user: { id: userId }, role: { id: roleId } },
    });

    if (existingUserRole) {
      throw new BadRequestException('Este rol ya ha sido asignado al usuario');
    }

    const userRole = this.userRoleRepository.create({
      user: { id: userId } as User,
      role: { id: roleId } as Role,
    });

    await this.userRoleRepository.save(userRole);
  }

  async assignPermission(roleId: number, assignPermissionDto: AssignPermissionDto): Promise<{ message: string; role: Role }> {
    const role = await this.findRoleById(roleId);

    let permission = await this.permissionRepository.findOne({
      where: {
        action: assignPermissionDto.action,
        resource: assignPermissionDto.resource,
      },
    });

    if (!permission) {
      permission = this.permissionRepository.create({
        action: assignPermissionDto.action,
        resource: assignPermissionDto.resource,
        description: assignPermissionDto.description,
      });
      await this.permissionRepository.save(permission);
    } else {
    }

    if (role.permissions.some((p) => p.id === permission.id)) {
      throw new BadRequestException('Este permiso ya ha sido asignado al rol');
    }

    if (!role.permissions) {
      role.permissions = [];
    }

    role.permissions.push(permission);

    await this.roleRepository.save(role);

    return {
      message: 'Permiso asignado con éxito',
      role,
    };
  }
  async findPermissionsByRole(roleId: number): Promise<{ message: string; permissions: Permission[] }> {
    const role = await this.findRoleById(roleId);

    if (role.permissions.length === 0) {
      throw new NotFoundException('Este rol no tiene permisos asignados');
    }

    return {
      message: 'Permisos recuperados con éxito',
      permissions: role.permissions,
    };
  }
}
