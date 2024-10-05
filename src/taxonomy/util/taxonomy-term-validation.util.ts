import { BadRequestException } from '@nestjs/common';

export function validateName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new BadRequestException('El campo "name" es obligatorio');
  }
}

export function validateSlug(slug: string): string {
  // Limpiamos los espacios en blanco al principio y al final
  const cleanedSlug = slug.trim();

  // Verificamos si el slug es válido, pero no si está presente
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(cleanedSlug)) {
    throw new BadRequestException('El campo "slug" debe ser un identificador válido (solo letras minúsculas, números y guiones).');
  }

  return cleanedSlug;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
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
