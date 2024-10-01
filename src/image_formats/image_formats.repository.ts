import { Repository } from 'typeorm';
import { ImageFormat } from './entities/image_format.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageFormatsRepository extends Repository<ImageFormat> { }