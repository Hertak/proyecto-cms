import * as dotenv from 'dotenv';
dotenv.config();
export const ImageConfig = {
  formats: {
    large: { width: parseInt(process.env.IMAGE_LARGE_WIDTH, 10) || 1024 },
    medium: { width: parseInt(process.env.IMAGE_MEDIUM_WIDTH, 10) || 512 },
    small: { width: parseInt(process.env.IMAGE_SMALL_WIDTH, 10) || 256 },
  },
  storagePath: process.env.IMAGE_STORAGE_PATH || './uploads',
};
