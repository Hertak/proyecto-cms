import { AppDataSource } from '../../ormconfig';
import { SeedRolesAndPermissions } from '@/seeds/seeds';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module'; // Asegúrate que la ruta sea correcta
import { TaxonomySeedService } from '@/seeds/taxonomy-seed.service'; // Servicio de seeds de taxonomías

async function runSeed() {
  try {
    console.log('Ejecutando el seed...');

    // Inicializa la fuente de datos
    await AppDataSource.initialize();

    // Ejecuta el seed de Roles y Permisos
    const seed = new SeedRolesAndPermissions();
    await seed.run(AppDataSource);

    // Crear el contexto de la aplicación NestJS para ejecutar el seed de taxonomías
    const app = await NestFactory.createApplicationContext(AppModule);

    // Obtiene el servicio de seed de taxonomías e imágenes
    const taxonomySeedService = app.get(TaxonomySeedService);
    await taxonomySeedService.runSeed(); // Ejecuta el seed de taxonomías

    console.log('Seed ejecutado con éxito.');

    // Cierra la conexión de la base de datos y la aplicación NestJS
    await AppDataSource.destroy();
    await app.close();
  } catch (error) {
    console.error('Error al ejecutar el seed:', error);
    process.exit(1);
  }
}

runSeed();
