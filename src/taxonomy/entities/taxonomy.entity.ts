import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Term } from './terms.entity';

@Entity('taxonomies')
export class Taxonomy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  entityName: string;

  @ManyToOne(() => Taxonomy, (taxonomy) => taxonomy.children, { nullable: true })
  parent: Taxonomy;

  @OneToMany(() => Taxonomy, (taxonomy) => taxonomy.parent)
  children: Taxonomy[];

  @OneToMany(() => Term, (term) => term.taxonomy)
  terms: Term[];
}
