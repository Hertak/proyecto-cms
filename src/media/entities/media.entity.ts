import { ImageFormat } from '@/image_formats/entities/image_format.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  storedFileName: string;

  @Column()
  mime: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  size: number;

  @Column()
  width: number;

  @Column()
  height: number;

  @Column()
  url: string;

  @Column()
  usage: string;

  @OneToMany(() => ImageFormat, (imageFormat) => imageFormat.media)
  imageFormats: ImageFormat[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
