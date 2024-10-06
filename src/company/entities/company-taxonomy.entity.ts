import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { Taxonomy } from '@/taxonomy/entities/taxonomy.entity';

@Entity('company_taxonomies')
export class CompanyTaxonomy {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ManyToOne(() => Taxonomy, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taxonomyId' })
  taxonomy: Taxonomy;
}
