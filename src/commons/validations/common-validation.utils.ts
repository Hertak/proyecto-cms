import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';

export function validateAndFormatName(name: string): string {
  if (!name) {
    throw new BadRequestException('no puede estar vacío. Debe tener al menos 3 caracteres y máximo 50.');
  }
  name = name.trim();
  if (name.length < 3 || name.length > 50) {
    throw new BadRequestException('debe tener entre 3 y 50 caracteres.');
  }
  name = name.charAt(0).toUpperCase() + name.slice(1);

  return name;
}

export function validateSlug(slug: string): string {
  if (!slug) {
    throw new BadRequestException('no puede estar vacío.');
  }

  const cleanedSlug = slug.trim();
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(cleanedSlug)) {
    throw new BadRequestException('solo puede contener letras minúsculas, números y guiones.');
  }

  return cleanedSlug;
}
export async function validateUniqueName(name: string, repository: Repository<any>): Promise<void> {
  const existingEntity = await repository.findOne({ where: { name } });
  if (existingEntity) {
    throw new BadRequestException(`Ya existe un registro con el nombre ${name}.`);
  }
}

export async function generateUniqueSlug(name: string, repository: Repository<any>): Promise<string> {
  if (!name) {
    throw new BadRequestException('no puede estar vacío para generar el slug');
  }

  name = name.trim();
  name = name.normalize('NFD').replace(/[̀-ͯ]/g, '');
  name = name.toLowerCase();

  let slug = name.replace(/\s+/g, '-');

  let count = 1;
  let uniqueSlug = slug;
  while (await repository.findOne({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${count++}`;
  }

  return uniqueSlug;
}

export function validateDescription(description?: string): void {
  if (description && description.length > 255) {
    throw new BadRequestException('no puede tener más de 255 caracteres.');
  }
}

export function validatePhoneNumber(phone: string): void {
  const phoneRegex = /^[0-9]{7,15}$/;
  if (!phoneRegex.test(phone)) {
    throw new BadRequestException('debe contener entre 7 y 15 dígitos numéricos.');
  }
}

export function validateFieldIsNotEmpty(field: string, fieldName: string): void {
  if (!field || field.trim().length === 0) {
    throw new BadRequestException(`El campo "${fieldName}" es obligatorio.`);
  }
}
