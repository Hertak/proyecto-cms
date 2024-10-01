import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { ImageConfig } from '@/config/image.config';

export function generateFilePath(usage: string, extension: string): { fileName: string; filePath: string } {
  const uuid = uuidv4();
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');

  const folderPath = path.join(process.cwd(), 'public', ImageConfig.storagePath, usage, year.toString(), month);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const fileName = `${uuid}.${extension}`;
  const filePath = path.join(folderPath, fileName);

  return { fileName, filePath };
}
