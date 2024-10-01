import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { ImageConfig } from '@/config/image.config';

@Injectable()
export class ImageProcessingService {
  async createImageFormats(buffer: Buffer, dynamicPath: string, baseFileName: string): Promise<any[]> {
    const formats = [
      { name: 'large', width: ImageConfig.formats.large.width, prefix: 'large-' },
      { name: 'medium', width: ImageConfig.formats.medium.width, prefix: 'medium-' },
      { name: 'small', width: ImageConfig.formats.small.width, prefix: 'small-' },
    ];

    const processedImages = [];

    for (const format of formats) {
      const fileName = `${format.prefix}${baseFileName}`;
      const filePath = path.join(dynamicPath, fileName);

      await sharp(buffer).resize(format.width).toFile(filePath);

      const metadata = await sharp(filePath).metadata();
      const fileSize = fs.statSync(filePath).size;

      processedImages.push({
        format: format.name,
        path: filePath,
        size: fileSize,
        width: metadata.width,
        height: metadata.height,
      });
    }

    return processedImages;
  }
}
