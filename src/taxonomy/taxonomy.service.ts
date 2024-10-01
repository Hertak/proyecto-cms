import { Injectable } from '@nestjs/common';
import { CreateTaxonomyDto } from './dto/create-taxonomy.dto';
import { UpdateTaxonomyDto } from './dto/update-taxonomy.dto';

@Injectable()
export class TaxonomyService {
  create(createTaxonomyDto: CreateTaxonomyDto) {
    return 'This action adds a new taxonomy';
  }

  findAll() {
    return `This action returns all taxonomy`;
  }

  findOne(id: number) {
    return `This action returns a #${id} taxonomy`;
  }

  update(id: number, updateTaxonomyDto: UpdateTaxonomyDto) {
    return `This action updates a #${id} taxonomy`;
  }

  remove(id: number) {
    return `This action removes a #${id} taxonomy`;
  }
}
