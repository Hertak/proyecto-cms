import { BadRequestException } from '@nestjs/common';

export function validateAndFormatTagName(name: string): string {
  if (!name) {
    throw new BadRequestException('El campo "name" no puede estar vacío. Debe tener al menos 3 caracteres y máximo 50.');
  }

  // Eliminar espacios al principio y al final
  name = name.trim();

  // Validar longitud mínima y máxima
  if (name.length < 3 || name.length > 50) {
    throw new BadRequestException('El campo "name" debe tener entre 3 y 50 caracteres.');
  }

  // Convertir la primera letra a mayúscula
  name = name.charAt(0).toUpperCase() + name.slice(1);

  return name;
}

export async function generateSlug(name: string, tagRepository): Promise<string> {
  if (!name) {
    throw new BadRequestException('El campo "name" no puede estar vacío para generar el slug');
  }

  name = name.trim();

  name = name.normalize('NFD').replace(/[̀-ͯ]/g, '');

  name = name.toLowerCase();

  let slug = name.replace(/\s+/g, '-');

  let count = 1;
  let uniqueSlug = slug;
  while (await tagRepository.findOne({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${count++}`;
  }

  return uniqueSlug;
}

export async function validateUniqueTag(name: string, entityName: string, tagRepository): Promise<void> {
  name = name.trim().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const existingTag = await tagRepository.findOne({ where: { name, entityName } });
  if (existingTag) {
    throw new BadRequestException(`El tag con el nombre "${name}" ya existe para la entidad "${entityName}"`);
  }
}

export function validateSlug(slug: string): string {
  if (!slug) {
    throw new BadRequestException('El campo "slug" no puede estar vacío.');
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new BadRequestException('El campo "slug" solo puede contener letras minúsculas, números y guiones.');
  }

  return slug;
}
