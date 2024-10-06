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
import { Company } from '@/company/entities/company.entity';
import { CompanyUser } from '@/company/entities/company-user.entity';
import { CompanyTaxonomy } from '@/company/entities/company-taxonomy.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Auth, Media, ImageFormat, UserRole, Role, Permission, Taxonomy, Tag, Company, CompanyUser, CompanyTaxonomy],
  migrations: [__dirname + '/../migrations/*.{js,ts}'],
  synchronize: true,
  logging: false,
});
