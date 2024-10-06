import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompanyUser } from './entities/company-user.entity';
import { In, Repository } from 'typeorm';
import { MediaService } from '@/media/media.service';
import { generateUniqueSlug, validateAndFormatName, validateUniqueName } from '@/commons/validations/common-validation.utils';
import { User } from '@/users/entities/user.entity';
import { validateFacebookInput, validateInstagramUsername, validateWhatsAppNumber } from '@/commons/validations/networks-validation.util';
import { Taxonomy } from '@/taxonomy/entities/taxonomy.entity';
import { CompanyTaxonomy } from './entities/company-taxonomy.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company) private companyRepository: Repository<Company>,
    @InjectRepository(CompanyUser) private companyUserRepository: Repository<CompanyUser>,
    @InjectRepository(Taxonomy) private taxonomyRepository: Repository<Taxonomy>,
    @InjectRepository(CompanyTaxonomy) private companyTaxonomyRepository: Repository<CompanyTaxonomy>,
    private readonly mediaService: MediaService,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, user: User, logoFile?: Express.Multer.File, coverFile?: Express.Multer.File) {
    const formattedName = validateAndFormatName(createCompanyDto.name);

    await validateUniqueName(formattedName, this.companyRepository);

    const taxonomyIds = createCompanyDto.taxonomyIds?.map((id) => Number(id));

    if (taxonomyIds && taxonomyIds.some(isNaN)) {
      throw new BadRequestException('Los IDs de taxonomía deben ser números.');
    }

    const whatsapp = validateWhatsAppNumber(createCompanyDto.whatsapp);

    if (createCompanyDto.facebook) {
      validateFacebookInput(createCompanyDto.facebook);
    }

    if (createCompanyDto.instagram) {
      validateInstagramUsername(createCompanyDto.instagram);
    }

    const slug = await generateUniqueSlug(createCompanyDto.name, this.companyRepository);

    const logo = logoFile ? await this.mediaService.uploadAndProcessImage(logoFile, 'Company', 'Logo de la empresa') : null;

    const cover = coverFile ? await this.mediaService.uploadAndProcessImage(coverFile, 'Company', 'Cover de la empresa') : null;

    let taxonomies = [];
    if (createCompanyDto.taxonomyIds && createCompanyDto.taxonomyIds.length > 0) {
      taxonomies = await this.taxonomyRepository.findBy({
        id: In(createCompanyDto.taxonomyIds),
      });

      if (taxonomies.length !== createCompanyDto.taxonomyIds.length) {
        throw new BadRequestException('Algunas taxonomías proporcionadas no son válidas.');
      }
    }

    const company = this.companyRepository.create({
      name: formattedName,
      description: createCompanyDto.description,
      whatsapp,
      facebook: createCompanyDto.facebook,
      instagram: createCompanyDto.instagram,
      logo,
      cover,
      slug,
      isActive: createCompanyDto.isActive ?? true,
      offersFullDayService: createCompanyDto.offersFullDayService ?? false,
    });

    await this.companyRepository.save(company);

    const companyUser = this.companyUserRepository.create({
      company,
      user,
    });

    await this.companyUserRepository.save(companyUser);

    for (const taxonomy of taxonomies) {
      const companyTaxonomy = this.companyTaxonomyRepository.create({
        company,
        taxonomy,
      });
      await this.companyTaxonomyRepository.save(companyTaxonomy);
    }

    return { message: `${company.name} fue creada exitosamente` };
  }

  findAll() {
    return `This action returns all company`;
  }

  findOne(id: number) {
    return `This action returns a #${id} company`;
  }

  update(id: number, updateCompanyDto: UpdateCompanyDto) {
    return `This action updates a #${id} company`;
  }

  remove(id: number) {
    return `This action removes a #${id} company`;
  }
}
