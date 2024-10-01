import { BadRequestException } from '@nestjs/common';

export function validateName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new BadRequestException('El campo "name" es obligatorio');
  }
}

export function validateSlug(slug: string): void {
  if (!slug || slug.trim().length === 0) {
    throw new BadRequestException('El campo "slug" es obligatorio');
  }

  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) {
    throw new BadRequestException('El campo "slug" debe ser un identificador válido (solo letras minúsculas, números y guiones).');
  }
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

export function validateDescription(description?: string): void {
  if (description && description.length > 255) {
    throw new BadRequestException('El campo "description" no puede tener más de 255 caracteres.');
  }
}

export function validateEntityName(entityName: string): void {
  if (!entityName || entityName.trim().length === 0) {
    throw new BadRequestException('El campo "entityName" es obligatorio');
  }
}
