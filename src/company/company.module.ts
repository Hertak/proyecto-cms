import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { UsersModule } from '@/users/users.module';
import { MediaModule } from '@/media/media.module';
import { TaxonomyModule } from '@/taxonomy/taxonomy.module';
import { CompanyUser } from './entities/company-user.entity';
import { CompanyTaxonomy } from './entities/company-taxonomy.entity';
import { CreateCompanyTaxService } from './create-company-tax.service';

@Module({
  imports: [TypeOrmModule.forFeature([Company, CompanyUser, CompanyTaxonomy]), UsersModule, MediaModule, TaxonomyModule],
  controllers: [CompanyController],
  providers: [CompanyService, CreateCompanyTaxService],
})
export class CompanyModule {}
