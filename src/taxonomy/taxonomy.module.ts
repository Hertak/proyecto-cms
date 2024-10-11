import { Module } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';
import { TaxonomyController } from './taxonomy.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Taxonomy } from './entities/taxonomy.entity';
import { Media } from '@/media/entities/media.entity';
import { MediaModule } from '@/media/media.module';
import { RolesModule } from '@/roles/roles.module';
import { TaxonomySeedService } from '@/seeds/taxonomy-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Taxonomy, Media]), RolesModule, MediaModule],
  controllers: [TaxonomyController],
  providers: [TaxonomyService, TaxonomySeedService],
  exports: [TaxonomyService, TypeOrmModule, TaxonomySeedService],
})
export class TaxonomyModule {}
