import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { validateAndFormatName, generateUniqueSlug, validateUniqueName } from '@/commons/validations/common-validation.utils';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const formattedName = validateAndFormatName(createTagDto.name);

    await validateUniqueName(formattedName, this.tagRepository);

    const slug = await generateUniqueSlug(formattedName, this.tagRepository);

    const newTag = this.tagRepository.create({
      ...createTagDto,
      name: formattedName,
      slug,
    });

    // Guardar el nuevo tag en la base de datos
    return this.tagRepository.save(newTag);
  }
  async findAll(entityName?: string, search?: string, page: number = 1, limit: number = 10, order?: string): Promise<any> {
    const query = this.tagRepository.createQueryBuilder('tag');

    if (entityName) {
      query.andWhere('tag.entityName = :entityName', { entityName });
    }

    if (search) {
      query.andWhere('tag.name ILIKE :search', { search: `%${search}%` });
    }

    if (order) {
      const [orderBy, direction] = order.split(':');
      if (['id', 'name', 'slug', 'entityName'].includes(orderBy)) {
        query.orderBy(`tag.${orderBy}`, direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC');
      }
    } else {
      query.orderBy('tag.id', 'ASC'); // Orden predeterminado
    }

    const totalItems = await query.getCount();
    const totalPages = Math.ceil(totalItems / limit);

    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    const tags = await query.getMany();

    return {
      data: tags,
      total_items: totalItems,
      total_pages: totalPages,
      current_page: page,
    };
  }

  async findOne(id: number): Promise<Tag> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new BadRequestException(`La etiqueta con ID ${id} no fue encontrada.`);
    }
    return tag;
  }

  async update(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);

    if (updateTagDto.name) {
      tag.name = validateAndFormatName(updateTagDto.name);
    }

    if (updateTagDto.name) {
      tag.slug = await generateUniqueSlug(tag.name, this.tagRepository);
    }

    Object.assign(tag, updateTagDto);
    return this.tagRepository.save(tag);
  }

  async remove(id: number): Promise<void> {
    const tag = await this.findOne(id);
    await this.tagRepository.remove(tag);
  }
}
