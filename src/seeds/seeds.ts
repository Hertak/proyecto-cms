import { DataSource } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '@/roles/entities/permission.entity';

export class SeedRolesAndPermissions {
  public async run(dataSource: DataSource): Promise<void> {
    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);

    const permissions = [
      {
        action: 'CREATE',
        resource: 'PROFILE',
        description: 'Permite crear el perfil',
      },
      {
        action: 'EDIT',
        resource: 'PROFILE',
        description: 'Permite editar el perfil',
      },
      {
        action: 'VIEW',
        resource: 'PROFILE',
        description: 'Permite ver el perfil',
      },
      {
        action: 'CREATE',
        resource: 'GALLERY',
        description: 'Permite crear una galería',
      },
      {
        action: 'EDIT',
        resource: 'GALLERY',
        description: 'Permite editar una galería',
      },
      {
        action: 'VIEW',
        resource: 'GALLERY',
        description: 'Permite ver una galería',
      },
      {
        action: 'DELETE',
        resource: 'GALLERY',
        description: 'Permite borrar una galería',
      },

      {
        action: 'MANAGE',
        resource: 'ALL',
        description: 'Permite gestionar todo en el sistema',
      },
    ];

    for (const permissionData of permissions) {
      let permission = await permissionRepository.findOne({
        where: {
          action: permissionData.action,
          resource: permissionData.resource,
        },
      });

      if (!permission) {
        permission = permissionRepository.create(permissionData);
        await permissionRepository.save(permission);
      }
    }

    let adminRole = await roleRepository.findOne({ where: { name: 'Admin' } });
    if (!adminRole) {
      adminRole = roleRepository.create({
        name: 'Admin',
        description: 'Rol con acceso completo a todo el sistema',
      });
      await roleRepository.save(adminRole);
    }

    let userRole = await roleRepository.findOne({ where: { name: 'Usuario' } });
    if (!userRole) {
      userRole = roleRepository.create({
        name: 'Usuario',
        description: 'Rol con permisos para gestionar su propio perfil y galería',
      });
      await roleRepository.save(userRole);
    }
    let profesionalRole = await roleRepository.findOne({ where: { name: 'Profesional' } });
    if (!userRole) {
      profesionalRole = roleRepository.create({
        name: 'Profesional',
        description: 'Rol con permisos para gestionar su propio perfil y galería',
      });
      await roleRepository.save(profesionalRole);
    }

    const manageAllPermission = await permissionRepository.findOne({
      where: { action: 'MANAGE', resource: 'ALL' },
    });
    adminRole.permissions = [manageAllPermission];
    await roleRepository.save(adminRole);

    const userPermissions = await permissionRepository.find({
      where: [
        { action: 'CREATE', resource: 'PROFILE' },
        { action: 'EDIT', resource: 'PROFILE' },
        { action: 'VIEW', resource: 'PROFILE' },
        { action: 'CREATE', resource: 'GALLERY' },
        { action: 'EDIT', resource: 'GALLERY' },
        { action: 'VIEW', resource: 'GALLERY' },
        { action: 'DELETE', resource: 'GALLERY' },
      ],
    });
    userRole.permissions = userPermissions;
    await roleRepository.save(userRole);

    const profesionalPermissions = await permissionRepository.find({
      where: [
        { action: 'CREATE', resource: 'PROFILE' },
        { action: 'EDIT', resource: 'PROFILE' },
        { action: 'VIEW', resource: 'PROFILE' },
        { action: 'CREATE', resource: 'GALLERY' },
        { action: 'EDIT', resource: 'GALLERY' },
        { action: 'VIEW', resource: 'GALLERY' },
        { action: 'DELETE', resource: 'GALLERY' },
      ],
    });
    profesionalRole.permissions = profesionalPermissions;
    await roleRepository.save(profesionalRole);
  }
}
