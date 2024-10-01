import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ImageProcessingService } from './image-processing.service';
import { generateFilePath } from './utils/file-path.util';
import { MediaUsage } from '@/commons/enums/media-usage.enum';
import { Media } from './entities/media.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ImageFormat } from '@/image_formats/entities/image_format.entity';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(ImageFormat)
    private readonly imageFormatsRepository: Repository<ImageFormat>,
    private readonly imageProcessingService: ImageProcessingService,
  ) {}

  async findAllWithFormats(page: number = 1, limit: number = 10, usage?: MediaUsage) {
    const maxLimit = 100;
    limit = limit > maxLimit ? maxLimit : limit;

    const skip = (page - 1) * limit;

    const whereConditions: FindOptionsWhere<Media> = {};
    if (usage) {
      whereConditions.usage = usage;
    }

    const [images, totalItems] = await this.mediaRepository.findAndCount({
      where: whereConditions,
      relations: ['imageFormats'],
      skip: skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      images,
      total_items: totalItems,
      total_pages: totalPages,
      current_page: page,
    };
  }
  async uploadAndProcessImage(file: Express.Multer.File, usage: MediaUsage, description?: string, name?: string) {
    const validUsageValues = Object.values(MediaUsage);

    if (!validUsageValues.includes(usage)) {
      throw new BadRequestException(`El valor de usage "${usage}" no es válido. Los valores permitidos son: ${validUsageValues.join(', ')}.`);
    }
    const extension = file.originalname.split('.').pop();
    const { fileName, filePath } = generateFilePath(usage, extension);

    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    try {
      fs.writeFileSync(filePath, file.buffer);
    } catch (error) {
      throw new BadRequestException('Error al guardar la imagen en el servidor');
    }
    const image = sharp(file.buffer);
    const metadata = await image.metadata();
    const processedImages = await this.imageProcessingService.createImageFormats(file.buffer, path.dirname(filePath), fileName);

    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const media = new Media();
    media.name = name ? name : file.originalname;
    media.storedFileName = fileName;
    media.mime = file.mimetype;
    media.size = file.size;
    media.width = metadata.width;
    media.height = metadata.height;
    media.url = `/uploads/${usage}/${year}/${month}/${fileName}`;
    media.usage = usage;
    media.description = description;

    const savedMedia = await this.mediaRepository.save(media);

    const imageFormats = await Promise.all(
      processedImages.map(async (processedImage) => {
        const fileNameWithFormat = path.basename(processedImage.path);

        const publicUrl = `/uploads/${usage}/${year}/${month}/${fileNameWithFormat}`;

        const imageFormat = this.imageFormatsRepository.create({
          media: savedMedia,
          format: processedImage.format,
          width: processedImage.width,
          height: processedImage.height,
          size: processedImage.size,
          url: publicUrl,
        });
        return this.imageFormatsRepository.save(imageFormat);
      }),
    );

    savedMedia.imageFormats = imageFormats;

    const updatedMedia = await this.mediaRepository.findOne({
      where: { id: savedMedia.id },
      relations: ['imageFormats'],
    });

    return updatedMedia;
  }
  async findOneWithFormats(id: number): Promise<Media> {
    return this.mediaRepository.findOne({
      where: { id },
      relations: ['imageFormats'],
    });
  }
  async updateMedia(id: number, updateMediaDto: UpdateMediaDto): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException(`Imagen con ID ${id} no encontrada`);
    }

    if (updateMediaDto.name) {
      media.name = updateMediaDto.name;
    }

    if (updateMediaDto.description) {
      media.description = updateMediaDto.description;
    }

    return this.mediaRepository.save(media);
  }
  async deleteImage(id: number): Promise<{ message: string; media: Media }> {
    const media = await this.findOneWithFormats(id);

    if (!media) {
      throw new NotFoundException('Imagen no encontrada');
    }

    try {
      for (const format of media.imageFormats) {
        const filePath = path.join(process.cwd(), 'public', format.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      const mainImagePath = path.join(process.cwd(), 'public', media.url);
      if (fs.existsSync(mainImagePath)) {
        fs.unlinkSync(mainImagePath);
      }
    } catch (error) {
      throw new InternalServerErrorException('Error al eliminar los archivos de la imagen');
    }

    const deletedMedia = { ...media };
    await this.imageFormatsRepository.delete({ media });
    await this.mediaRepository.delete(id);
    return {
      message: 'Imagen borrada con éxito',
      media: deletedMedia,
    };
  }
}
