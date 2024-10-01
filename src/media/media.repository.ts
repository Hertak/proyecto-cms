import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Media } from './entities/media.entity';

@Injectable()
export class MediaRepository extends Repository<Media> {
  constructor(private dataSource: DataSource) {
    super(Media, dataSource.createEntityManager());
  }
}
