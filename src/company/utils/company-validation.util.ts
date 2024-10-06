import { Taxonomy } from '@/taxonomy/entities/taxonomy.entity';
import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';

export async function verifyCompanyLimit(userId: number, companyUserRepository: Repository<any>): Promise<void> {
  const companyCount = await companyUserRepository.count({ where: { user: { id: userId } } });
  if (companyCount > 0) {
    throw new BadRequestException('No puedes crear más de una compañía.');
  }
}

export async function verifyTaxonomy(taxonomyId: number, taxonomyRepository: Repository<Taxonomy>): Promise<Taxonomy> {
  const taxonomy = await taxonomyRepository.findOne({ where: { id: taxonomyId } });
  if (!taxonomy) {
    throw new BadRequestException('La taxonomía proporcionada no es válida.');
  }
  return taxonomy;
}
