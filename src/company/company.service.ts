import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  async getCompaniesWithTaxonomies(): Promise<any> {
    const companiesWithTaxonomies = await this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndMapMany('company.taxonomies', CompanyTaxonomy, 'companyTaxonomy', 'companyTaxonomy.companyId = company.id')
      .leftJoinAndMapMany('company.taxonomies', Taxonomy, 'taxonomy', 'taxonomy.id = companyTaxonomy.taxonomyId')
      .select(['company.id', 'company.name', 'taxonomy.id', 'taxonomy.name'])
      .getMany();

    return companiesWithTaxonomies;
  }

  async getTaxonomiesWithCompanies(
    page: number = 1,
    limit: number = 10,
    searchTerm?: string,
    taxonomyId?: number,
    sortBy: string = 'company.name',
    sortOrder: 'ASC' | 'DESC' = 'ASC',
  ): Promise<any> {
    const offset = (page - 1) * limit;

    const query = this.taxonomyRepository
      .createQueryBuilder('taxonomy')
      .leftJoinAndMapMany('taxonomy.companyTaxonomy', CompanyTaxonomy, 'companyTaxonomy', 'companyTaxonomy.taxonomyId = taxonomy.id')
      .leftJoinAndMapMany('companyTaxonomy.company', Company, 'company', 'company.id = companyTaxonomy.companyId')
      .leftJoinAndMapOne('company.logo', 'company.logo', 'logo')
      .where('taxonomy.entityName = :entityName', { entityName: 'Company' });

    if (taxonomyId) {
      query.andWhere('taxonomy.id = :taxonomyId', { taxonomyId });
    }

    if (searchTerm) {
      query.andWhere('company.name LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
    }

    query.orderBy(sortBy, sortOrder);

    const totalItems = await query.getCount();

    const taxonomiesWithCompanies = await query.offset(offset).limit(limit).getRawMany();

    const structuredData = taxonomiesWithCompanies.reduce((acc, current) => {
      const taxonomyId = current.taxonomy_id;
      const taxonomyName = current.taxonomy_name;
      const company = {
        id: current.company_id,
        name: current.company_name,
        description: current.company_description,
        logoId: current.logo_id,
      };

      const existingTaxonomy = acc.find((taxonomy) => taxonomy.id === taxonomyId);
      if (existingTaxonomy) {
        existingTaxonomy.companies.push(company);
      } else {
        acc.push({
          id: taxonomyId,
          name: taxonomyName,
          companies: [company],
        });
      }
      return acc;
    }, []);

    const companiesWithLogos = await Promise.all(
      structuredData.map(async (taxonomy) => {
        const companies = await Promise.all(
          taxonomy.companies.map(async (company) => {
            const logoData = await this.mediaService.findOneWithFormats(company.logoId);
            return { ...company, logo: logoData };
          }),
        );
        return { ...taxonomy, companies };
      }),
    );

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items: companiesWithLogos,
      total_items: totalItems,
      total_pages: totalPages,
      current_page: page,
    };
  }

  async updateCompany(
    companyId: number,
    updateCompanyDto: UpdateCompanyDto,
    userId: number,
    isAdmin: boolean,
    logoFile?: Express.Multer.File,
    coverFile?: Express.Multer.File,
  ): Promise<any> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['logo', 'cover'],
    });

    if (!company) {
      throw new NotFoundException('La compañía no fue encontrada');
    }

    const userCompanyRelation = await this.companyUserRepository.findOne({
      where: { company: { id: company.id }, user: { id: userId } },
    });

    if (!userCompanyRelation && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para editar esta compañía');
    }

    const taxonomyIds = updateCompanyDto.taxonomyIds?.map((id) => Number(id));

    if (taxonomyIds && taxonomyIds.some(isNaN)) {
      throw new BadRequestException('Los IDs de taxonomía deben ser números.');
    }

    let taxonomies = [];
    if (taxonomyIds && taxonomyIds.length > 0) {
      taxonomies = await this.taxonomyRepository.findBy({
        id: In(taxonomyIds),
      });

      if (taxonomies.length !== taxonomyIds.length) {
        throw new BadRequestException('Algunas taxonomías proporcionadas no son válidas.');
      }

      await this.companyTaxonomyRepository.delete({ company: { id: company.id } });

      for (const taxonomy of taxonomies) {
        const companyTaxonomy = this.companyTaxonomyRepository.create({
          company,
          taxonomy,
        });
        await this.companyTaxonomyRepository.save(companyTaxonomy);
      }
    }

    if (updateCompanyDto.name) {
      updateCompanyDto.name = validateAndFormatName(updateCompanyDto.name);
      await validateUniqueName(updateCompanyDto.name, this.companyRepository);
    }

    if (updateCompanyDto.whatsapp) {
      updateCompanyDto.whatsapp = validateWhatsAppNumber(updateCompanyDto.whatsapp);
    }

    if (updateCompanyDto.facebook) {
      validateFacebookInput(updateCompanyDto.facebook);
    }

    if (updateCompanyDto.instagram) {
      validateInstagramUsername(updateCompanyDto.instagram);
    }

    let oldLogo = null;
    let oldCover = null;

    if (logoFile) {
      oldLogo = company.logo;
      const newLogo = await this.mediaService.uploadAndProcessImage(logoFile, 'Company', 'Logo de la empresa');
      company.logo = newLogo;
    }

    if (coverFile) {
      oldCover = company.cover;
      const newCover = await this.mediaService.uploadAndProcessImage(coverFile, 'Company', 'Cover de la empresa');
      company.cover = newCover;
    }

    Object.assign(company, updateCompanyDto);

    await this.companyRepository.save(company);

    if (oldLogo) {
      await this.mediaService.deleteImage(oldLogo.id);
    }

    if (oldCover) {
      await this.mediaService.deleteImage(oldCover.id);
    }

    return { message: `La compañía ${company.name} fue actualizada exitosamente` };
  }

  async findOne(companyId: number): Promise<any> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['logo', 'cover'],
    });

    if (!company) {
      throw new NotFoundException('La compañía no fue encontrada');
    }

    const taxonomies = await this.companyTaxonomyRepository
      .createQueryBuilder('companyTaxonomy')
      .innerJoinAndSelect('companyTaxonomy.taxonomy', 'taxonomy')
      .where('companyTaxonomy.company = :companyId', { companyId })
      .getMany();

    const logoData = company.logo ? await this.mediaService.findOneWithFormats(company.logo.id) : null;
    const coverData = company.cover ? await this.mediaService.findOneWithFormats(company.cover.id) : null;

    return {
      id: company.id,
      name: company.name,
      description: company.description,
      whatsapp: company.whatsapp,
      facebook: company.facebook,
      instagram: company.instagram,
      isActive: company.isActive,
      offersFullDayService: company.offersFullDayService,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      logo: logoData,
      cover: coverData,
      taxonomies: taxonomies.map((t) => ({ id: t.taxonomy.id, name: t.taxonomy.name })),
    };
  }

  async removeCompany(companyId: number, userId: number, isAdmin: boolean): Promise<any> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['logo', 'cover'],
    });

    if (!company) {
      throw new NotFoundException('La compañía no fue encontrada');
    }

    const userCompanyRelation = await this.companyUserRepository.findOne({
      where: { company: { id: company.id }, user: { id: userId } },
    });

    if (!userCompanyRelation && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para eliminar esta compañía');
    }

    await this.companyTaxonomyRepository.delete({ company: { id: company.id } });

    const logoId = company.logo ? company.logo.id : null;
    const coverId = company.cover ? company.cover.id : null;

    await this.companyRepository.remove(company);

    if (logoId) {
      await this.mediaService.deleteImage(logoId);
    }

    if (coverId) {
      await this.mediaService.deleteImage(coverId);
    }

    return { message: `La compañía ha sido eliminada exitosamente` };
  }
}
