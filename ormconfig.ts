import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '@/users/entities/user.entity';
import { Auth } from '@/auth/entities/auth.entity';
import { Media } from '@/media/entities/media.entity';
import { ImageFormat } from '@/image_formats/entities/image_format.entity';
import { UserRole } from '@/roles/entities/user-role.entity';
import { Role } from '@/roles/entities/role.entity';
import { Permission } from '@/roles/entities/permission.entity';
import { Taxonomy } from '@/taxonomy/entities/taxonomy.entity';
import { Tag } from '@/taxonomy/entities/tag.entity';

// Cargar variables de entorno
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres', // Cambia esto según tu base de datos (mysql, sqlite, etc.)
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Auth, Media, ImageFormat, UserRole, Role, Permission, Taxonomy, Tag],
  migrations: [__dirname + '/../migrations/*.{js,ts}'],
  synchronize: true, // En producción, asegúrate de usar migraciones en vez de synchronize: true
  logging: false, // Habilita logs de consultas y errores
});
