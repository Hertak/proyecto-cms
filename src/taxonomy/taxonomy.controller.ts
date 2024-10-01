import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';
import { CreateTaxonomyDto } from './dto/create-taxonomy.dto';
import { UpdateTaxonomyDto } from './dto/update-taxonomy.dto';

@Controller('taxonomy')
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Post()
  create(@Body() createTaxonomyDto: CreateTaxonomyDto) {
    return this.taxonomyService.create(createTaxonomyDto);
  }

  @Get()
  findAll() {
    return this.taxonomyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taxonomyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaxonomyDto: UpdateTaxonomyDto) {
    return this.taxonomyService.update(+id, updateTaxonomyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taxonomyService.remove(+id);
  }
}
