import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Taxonomy } from './taxonomy.entity';

@Entity('terms')
export class Term {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Term, (term) => term.children, { nullable: true })
  parent: Term;

  @OneToMany(() => Term, (term) => term.parent)
  children: Term[];

  @ManyToOne(() => Taxonomy, (taxonomy) => taxonomy.terms, { nullable: false })
  taxonomy: Taxonomy;
}
