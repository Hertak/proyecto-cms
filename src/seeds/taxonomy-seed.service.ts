import { Injectable } from '@nestjs/common';
import { TaxonomyService } from '../taxonomy/taxonomy.service';
import { MediaService } from '../media/media.service';
import { CreateTaxonomyDto } from '../taxonomy/dto/create-taxonomy.dto';
import { Taxonomy } from '../taxonomy/entities/taxonomy.entity';
import { Media } from '../media/entities/media.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TaxonomySeedService {
  constructor(
    private readonly taxonomyService: TaxonomyService,
    private readonly mediaService: MediaService,
  ) {}

  async runSeed() {
    const taxonomiesData = [
      {
        name: 'Cuidado de mascotas',
        description: 'Servicio de cuidado de mascotas, desde paseos hasta cuidados más avanzados.',
        entityName: 'Company',
        imagePath: './public/seeds/services/Cuidado_de_mascotas.jpg',
      },
      {
        name: 'Fletes',
        description: 'Servicio de transporte y mudanzas mediante fletes pequeños y grandes.',
        entityName: 'Company',
        imagePath: './public/seeds/services/Fletes.jpg',
      },
      {
        name: 'Decoración y diseño',
        description: 'Servicios de decoración de interiores y diseño de espacios.',
        entityName: 'Company',
        imagePath: './public/seeds/services/Decoracion_y_disenio.jpg',
      },
      {
        name: 'Enseñanza',
        description: 'Clases y tutorías para distintas materias y niveles educativos.',
        entityName: 'Company',
        imagePath: './public/seeds/services/Ensenianza.jpg',
      },
      {
        name: 'Plomero',
        description: 'Servicios de plomería y reparación de instalaciones sanitarias.',
        entityName: 'Company',
        imagePath: './public/seeds/services/Plomero.jpg',
      },
      {
        name: 'Electricista',
        description: 'Servicios de reparación y mantenimiento de instalaciones eléctricas.',
        entityName: 'Company',
        imagePath: './public/seeds/services/Electricista.jpg',
      },
      {
        name: 'Carpintero',
        description: 'Servicios de carpintería para muebles y reparaciones en el hogar.',
        entityName: 'Company',
        imagePath: './public/seeds/services/Carpintero.jpg',
      },
      {
        name: 'Pintor',
        description: 'Servicios de pintura de interiores y exteriores para todo tipo de superficies.',
        entityName: 'Company',
        imagePath: './public/seeds/services/Pintor.jpg',
      },
      {
        name: 'Jardinero',
        description: 'Servicios de jardinería y mantenimiento de espacios verdes.',
        entityName: 'Company',
        imagePath: './public/seeds/services/Jardinero.jpg',
      },
      {
        name: 'Albañil',
        description: 'Servicios de albañilería para obras y remodelaciones.',
        entityName: 'Company',
        imagePath: './public/seeds/services/Albanil.jpg',
      },
      {
        name: 'Gasista',
        description: 'Servicios de instalación y reparación de gas natural y envasado.',
        entityName: 'Company',
        imagePath: './public/seeds/services/Gasista.jpg',
      },
      {
        name: 'Metalúrgica',
        description: 'Servicios de metalurgia y fabricación de estructuras metálicas.',
        entityName: 'Company',
        imagePath: './public/seeds/services/Metalurgica.jpg',
      },
      {
        name: 'Reparación de electrodomésticos',
        description: 'Reparación de electrodomésticos de todas las marcas y tipos.',
        entityName: 'Company',
        imagePath: './public/seeds/services/Reparacion_de_electrodomesticos.jpg',
      },
      {
        name: 'Mantenimiento General',
        description: 'Servicios de mantenimiento integral para el hogar y la oficina.',
        entityName: 'Company',
        imagePath: './public/seeds/services/Mantenimiento_general.jpg',
      },
      {
        name: 'Instaladores de aberturas de Aluminio',
        description: 'Servicios de instalación de ventanas y puertas de aluminio.',
        entityName: 'Company',
        imagePath: './public/seeds/services/Instaladores_aberturas_aluminio.jpg',
      },
      {
        name: 'Limpieza doméstica',
        description: 'Servicios de limpieza para el hogar y espacios interiores.',
        entityName: 'Company',
        imagePath: './public/seeds/services/Limpieza_domestica.jpg',
      },
      {
        name: 'Cuidado de personas',
        description: 'Servicios de cuidado y atención a personas mayores o con necesidades especiales.',
        entityName: 'Company',
        imagePath: './public/seeds/services/Cuidado_de_personas.jpg',
      },
    ];

    for (const taxonomyData of taxonomiesData) {
      await this.createTaxonomyWithImage(taxonomyData);
    }
  }

  private async createTaxonomyWithImage(taxonomyData: { name: string; description: string; entityName: string; imagePath: string }) {
    let savedMedia: Media = null;

    if (taxonomyData.imagePath) {
      // Leer el archivo de imagen desde el sistema de archivos
      const filePath = path.resolve(taxonomyData.imagePath);
      const fileBuffer = fs.readFileSync(filePath);

      // Simulación de un archivo de tipo Multer
      const file: Express.Multer.File = {
        originalname: path.basename(filePath),
        mimetype: 'image/jpeg', // Ajusta según el tipo de imagen
        buffer: fileBuffer,
        size: fileBuffer.length,
      } as Express.Multer.File;

      // Llamar a la función de subida y procesamiento de la imagen
      savedMedia = await this.mediaService.uploadAndProcessImage(file, 'Company', taxonomyData.description, taxonomyData.name);
    }

    // Crear el DTO para la taxonomía
    const createTaxonomyDto: CreateTaxonomyDto = {
      name: taxonomyData.name,
      description: taxonomyData.description,
      entityName: taxonomyData.entityName,
      parentId: null, // Si necesitas vincular a un padre, ajusta aquí
      imageId: savedMedia ? savedMedia.id : null,
    };

    // Llamar al servicio de taxonomías para crear la nueva taxonomía
    const taxonomy: Taxonomy = await this.taxonomyService.create(createTaxonomyDto, savedMedia);

    console.log(`Taxonomía creada: ${taxonomy.name}`);
  }
}
