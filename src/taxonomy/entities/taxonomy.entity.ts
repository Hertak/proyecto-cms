import { Media } from '@/media/entities/media.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

@Entity('taxonomies')
export class Taxonomy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  slug: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: false })
  entityName: string;

  @ManyToOne(() => Taxonomy, (taxonomy) => taxonomy.children, { nullable: true })
  parent: Taxonomy;

  @OneToMany(() => Taxonomy, (taxonomy) => taxonomy.parent, { cascade: true })
  children: Taxonomy[];

  @ManyToOne(() => Media, { nullable: true })
  image: Media;
}
