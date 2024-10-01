import { PartialType } from '@nestjs/swagger';
import { CreateTaxonomyDto } from './create-taxonomy.dto';

export class UpdateTaxonomyDto extends PartialType(CreateTaxonomyDto) {}
