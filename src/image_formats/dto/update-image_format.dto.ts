import { PartialType } from '@nestjs/mapped-types';
import { CreateImageFormatDto } from './create-image_format.dto';

export class UpdateImageFormatDto extends PartialType(CreateImageFormatDto) {}
