import { forwardRef, Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { Media } from './entities/media.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ImageProcessingService } from './image-processing.service';

import { ImageFormat } from '@/image_formats/entities/image_format.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Media, ImageFormat])],

  providers: [MediaService, ImageProcessingService],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}
