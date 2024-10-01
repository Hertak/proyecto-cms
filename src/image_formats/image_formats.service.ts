import { Injectable } from '@nestjs/common';
import { CreateImageFormatDto } from './dto/create-image_format.dto';
import { UpdateImageFormatDto } from './dto/update-image_format.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageFormat } from './entities/image_format.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ImageFormatsService {
  constructor(
    @InjectRepository(ImageFormat)
    private readonly imageFormatsRepository: Repository<ImageFormat>,
  ) {}

  async saveFormats(formats: Array<any>, mediaId: number) {
    for (const format of formats) {
      await this.imageFormatsRepository.save({
        mediaId: mediaId,
        format: format.format,
        width: format.width,
        height: format.height,
        size: format.size,
        url: format.url,
      });
    }
  }
}
