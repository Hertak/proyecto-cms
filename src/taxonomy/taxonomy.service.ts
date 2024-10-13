import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaxonomyDto } from './dto/create-taxonomy.dto';
import { UpdateTaxonomyDto } from './dto/update-taxonomy.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Taxonomy } from './entities/taxonomy.entity';
import { Repository } from 'typeorm';
import { Media } from '@/media/entities/media.entity';
import { generateUniqueSlug, validateDescription, validateAndFormatName, validateSlug } from '@/commons/validations/common-validation.utils';
import { MediaService } from '@/media/media.service';

@Injectable()
export class TaxonomyService {
  constructor(
    @InjectRepository(Taxonomy)
    private readonly taxonomyRepository: Repository<Taxonomy>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly mediaService: MediaService,
  ) {}
  async create(createTaxonomyDto: CreateTaxonomyDto, savedMedia?: Media): Promise<Taxonomy> {
    const { name, slug, parentId, imageId, entityName, description, tax_type } = createTaxonomyDto;

    validateAndFormatName(name);

    let finalSlug: string;
    if (slug) {
      finalSlug = validateSlug(slug);
    } else {
      finalSlug = await generateUniqueSlug(name, this.taxonomyRepository);
    }

    await this.validateUniqueSlug(finalSlug);

    let parent: Taxonomy = null;
    let finalEntityName: string = entityName;

    if (parentId) {
      parent = await this.taxonomyRepository.findOne({ where: { id: parentId } });
      if (!parent) {
        throw new BadRequestException(`El padre con ID ${parentId} no existe.`);
      }

      finalEntityName = parent.entityName;
    }

    let image: Media = null;
    if (imageId) {
      image = await this.mediaRepository.findOne({ where: { id: imageId } });
      if (!image) {
        throw new BadRequestException(`La imagen con ID ${imageId} no existe.`);
      }
    }
    const finalTaxType = tax_type || 'Category';
    const taxonomy = this.taxonomyRepository.create({
      name,
      slug: finalSlug,
      description,
      entityName: finalEntityName,
      parent,
      tax_type: finalTaxType,
      image: savedMedia ? savedMedia : null,
    });

    return await this.taxonomyRepository.save(taxonomy);
  }

  async findAll(
    entityName?: string,
    name?: string,
    parentId?: number,
    tax_type?: string,
    orderField: string = 'id',
    order: 'ASC' | 'DESC' = 'ASC',
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    const query = this.taxonomyRepository
      .createQueryBuilder('taxonomy')
      .leftJoinAndSelect('taxonomy.image', 'image')
      .leftJoinAndSelect('image.imageFormats', 'imageFormats')
      .leftJoinAndSelect('taxonomy.children', 'children')
      .addSelect(['children.name', 'children.slug', 'children.description']);

    if (entityName) {
      query.andWhere('taxonomy.entityName = :entityName', { entityName });
    }

    if (name) {
      query.andWhere('taxonomy.name ILIKE :name', { name: `%${name}%` });
    }

    if (parentId) {
      query.andWhere('taxonomy.parent = :parentId', { parentId });
    } else {
      query.andWhere('taxonomy.parent IS NULL');
    }
    if (tax_type) {
      query.andWhere('taxonomy.tax_type = :tax_type', { tax_type });
    }
    const totalItems = await query.getCount();
    const totalPages = Math.ceil(totalItems / limit);

    query
      .orderBy(`taxonomy.${orderField}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const taxonomies = await query.getMany();

    if (taxonomies.length === 0) {
      return { message: 'La búsqueda no devolvió resultados.' };
    }

    return {
      data: taxonomies.map((taxonomy) => {
        if (taxonomy.parent) {
          taxonomy['parentId'] = taxonomy.parent.id;
        }
        return taxonomy;
      }),
      order: { [orderField]: order },
      total_items: totalItems,
      total_pages: totalPages,
      current_page: page,
    };
  }

  async findOne(id: number): Promise<Taxonomy> {
    const taxonomy = await this.taxonomyRepository.findOne({
      where: { id },
      relations: [
        'image',
        'image.imageFormats',
        'children',
        'children.children',
        'children.children.children',
        'children.children.children.children',
      ],
    });

    if (!taxonomy) {
      throw new NotFoundException(`No se encontró la taxonomía con el ID ${id}`);
    }

    return taxonomy;
  }

  async update(id: number, updateTaxonomyDto: UpdateTaxonomyDto, image?: Express.Multer.File): Promise<Taxonomy> {
    const taxonomy = await this.taxonomyRepository.findOne({ where: { id } });
    if (!taxonomy) {
      throw new NotFoundException(`Taxonomía con ID ${id} no encontrada`);
    }

    if (updateTaxonomyDto.name) {
      validateAndFormatName(updateTaxonomyDto.name);
    }

    if (updateTaxonomyDto.description) {
      validateDescription(updateTaxonomyDto.description);
    }
    try {
      if (updateTaxonomyDto.slug) {
        updateTaxonomyDto.slug = validateSlug(updateTaxonomyDto.slug);
      } else if (updateTaxonomyDto.name) {
        updateTaxonomyDto.slug = await generateUniqueSlug(updateTaxonomyDto.name, this.taxonomyRepository);
      }
    } catch (error) {
      throw new BadRequestException(`Error en la solicitud: ${error.message}`);
    }

    if (image) {
      const usage = updateTaxonomyDto.entityName || taxonomy.entityName;
      const newImage = await this.mediaService.uploadAndProcessImage(image, usage);
      taxonomy.image = newImage;
    }

    Object.assign(taxonomy, updateTaxonomyDto);

    if (updateTaxonomyDto.parentId) {
      const parent = await this.taxonomyRepository.findOne({ where: { id: updateTaxonomyDto.parentId } });
      if (!parent) {
        throw new NotFoundException(`Taxonomía padre con ID ${updateTaxonomyDto.parentId} no encontrada`);
      }
      taxonomy.parent = parent;
    }
    if (updateTaxonomyDto.tax_type) {
      taxonomy.tax_type = updateTaxonomyDto.tax_type;
    }
    return this.taxonomyRepository.save(taxonomy);
  }

  async remove(id: number): Promise<void> {
    const taxonomy = await this.taxonomyRepository.findOne({ where: { id } });
    if (!taxonomy) {
      throw new NotFoundException(`Taxonomía con ID ${id} no encontrada`);
    }
    await this.taxonomyRepository.remove(taxonomy);
  }

  async validateUniqueSlug(slug: string): Promise<void> {
    const existingTaxonomy = await this.taxonomyRepository.findOne({ where: { slug } });

    if (existingTaxonomy) {
      throw new BadRequestException(`El slug '${slug}' ya está en uso. Debe ser único.`);
    }
  }
}
