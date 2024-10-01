import { AppDataSource } from '../../ormconfig';
import { SeedRolesAndPermissions } from '@/seeds/seeds';

async function runSeed() {
  try {
    console.log('Ejecutando el seed...');
    await AppDataSource.initialize();
    const seed = new SeedRolesAndPermissions();
    await seed.run(AppDataSource);
    console.log('Seed ejecutado con éxito.');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error al ejecutar el seed:', error);
    process.exit(1);
  }
}

runSeed();
