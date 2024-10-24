import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { MediaModule } from './media/media.module';
import { ImageFormatsModule } from './image_formats/image_formats.module';
import { AuthModule } from './auth/auth.module';
import { AppDataSource } from './../ormconfig';
import { RolesModule } from './roles/roles.module';
import { TaxonomyModule } from './taxonomy/taxonomy.module';
import { TagModule } from './taxonomy/tag.module';
import { CompanyModule } from './company/company.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    UsersModule,
    MediaModule,
    ImageFormatsModule,
    AuthModule,
    RolesModule,
    TaxonomyModule,
    TagModule,
    CompanyModule,
    NotificationModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
