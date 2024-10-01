import { Media } from '../../media/entities/media.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';

@Entity('image_formats')
export class ImageFormat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Media, (media) => media.imageFormats)
  @JoinColumn({ name: 'media_id' })
  media: Media;

  @Column()
  format: string;

  @Column('int')
  width: number;

  @Column('int')
  height: number;

  @Column('int')
  size: number;

  @Column()
  url: string;
}
