import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyTaxonomy } from './entities/company-taxonomy.entity';
import { Company } from './entities/company.entity';
import { TaxonomyService } from '@/taxonomy/taxonomy.service';
import { CreateCompanyTaxonomyDto } from './dto/create-company-tax.dto';
import { Taxonomy } from '@/taxonomy/entities/taxonomy.entity';
import { CreateTaxonomyDto } from '@/taxonomy/dto/create-taxonomy.dto';
import { generateUniqueSlug } from '@/commons/validations/common-validation.utils';

@Injectable()
export class CreateCompanyTaxService {
  constructor(
    @InjectRepository(CompanyTaxonomy)
    private readonly companyTaxonomyRepository: Repository<CompanyTaxonomy>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    private readonly taxonomyService: TaxonomyService, // Inyectamos el servicio de taxonomía
  ) {}

  async create(createCompanyTaxonomyDto: CreateCompanyTaxonomyDto): Promise<CompanyTaxonomy> {
    const { companyId, name, description, parentId, imageId } = createCompanyTaxonomyDto;

    // Buscar la compañía por ID
    const company = await this.companyRepository.findOne({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException(`La compañía con ID ${companyId} no existe.`);
    }

    // Creamos la taxonomía usando el servicio existente
    const createTaxonomyDto = {
      name,
      description,
      parentId,
      imageId,
      entityName: 'Company', // Aseguramos que el entityName sea 'Company'
    };

    let taxonomy: Taxonomy;
    try {
      taxonomy = await this.taxonomyService.create(createTaxonomyDto);
    } catch (error) {
      throw new BadRequestException(`Error al crear la taxonomía: ${error.message}`);
    }

    // Crear la relación entre Company y Taxonomy
    const newCompanyTaxonomy = this.companyTaxonomyRepository.create({
      company: company as any,
      taxonomy: taxonomy as any,
    });

    // Guardar la relación en la base de datos
    return this.companyTaxonomyRepository.save(newCompanyTaxonomy);
  }
}
