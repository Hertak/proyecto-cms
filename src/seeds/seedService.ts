import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SeedRolesAndPermissions } from './seeds';
import { Role } from '@/roles/entities/role.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    const roleRepository = this.dataSource.getRepository(Role);

    const adminRole = await roleRepository.findOne({
      where: { name: 'Admin' },
    });

    if (!adminRole) {
      console.log('Seed ejecutándose por primera vez...');
      const seed = new SeedRolesAndPermissions();
      await seed.run(this.dataSource);
    } else {
      console.log('Seed ya ha sido ejecutado previamente. Saltando ejecución.');
    }
  }
}
