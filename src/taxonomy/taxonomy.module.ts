import { Module } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';
import { TaxonomyController } from './taxonomy.controller';

@Module({
  controllers: [TaxonomyController],
  providers: [TaxonomyService],
})
export class TaxonomyModule {}
