import { BadRequestException } from '@nestjs/common';

export function validateWhatsAppNumber(phone: string): string {
  // Remover espacios y validar el formato básico
  phone = phone.trim();
  const phoneRegex = /^[0-9]{7,15}$/;

  // Si no comienza con 54 o +54, agregar 54
  if (!phone.startsWith('54') && !phone.startsWith('+54')) {
    phone = '54' + phone;
  }

  if (!phoneRegex.test(phone.replace('+', ''))) {
    throw new BadRequestException('El número de WhatsApp debe contener entre 7 y 15 dígitos numéricos.');
  }

  return phone;
}

export function validateFacebookInput(facebook: string): void {
  facebook = facebook.startsWith('@') ? facebook.slice(1) : facebook;
  const facebookUsernameRegex = /^[A-Za-z0-9.]{5,}$/;
  const facebookUrlRegex = /^https?:\/\/www\.facebook\.com\/profile\.php\?id=\d+$/;
  if (!facebookUsernameRegex.test(facebook) && !facebookUrlRegex.test(facebook)) {
    throw new BadRequestException(
      'El nombre de usuario o URL de Facebook no es válido. Debe ser un nombre de usuario válido o una URL con "profile.php?id=".',
    );
  }
}

export function validateInstagramUsername(instagram: string): void {
  instagram = instagram.startsWith('@') ? instagram.slice(1) : instagram;
  const instagramRegex = /^[A-Za-z0-9._]{1,30}$/;
  if (!instagramRegex.test(instagram)) {
    throw new BadRequestException(
      'El nombre de usuario de Instagram no es válido. Debe tener entre 1 y 30 caracteres, y solo puede contener letras, números, puntos y guiones bajos.',
    );
  }
}
