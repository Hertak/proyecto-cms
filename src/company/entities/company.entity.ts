import { Media } from '@/media/entities/media.entity';
import { Taxonomy } from '@/taxonomy/entities/taxonomy.entity';
import { User } from '@/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  whatsapp: string;

  @Column({ nullable: true })
  facebook: string;

  @Column({ nullable: true })
  instagram: string;

  @OneToOne(() => Media, { nullable: true })
  @JoinColumn()
  logo: Media;

  @OneToOne(() => Media, { nullable: true })
  @JoinColumn()
  cover: Media;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  offersFullDayService: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
