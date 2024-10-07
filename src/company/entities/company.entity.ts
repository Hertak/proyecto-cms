import { Media } from '@/media/entities/media.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';

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
