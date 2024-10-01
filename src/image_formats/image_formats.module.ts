import { Module } from '@nestjs/common';
import { ImageFormatsService } from './image_formats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageFormat } from './entities/image_format.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ImageFormat])],
  providers: [ImageFormatsService],
  exports: [ImageFormatsService],
})
export class ImageFormatsModule {}
