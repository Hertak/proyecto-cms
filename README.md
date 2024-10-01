# API Backend

Este es el backend del proyecto **CMS** (Nombre pendiente), desarrollado utilizando **NestJS**, **TypeScript**, y **TypeORM**. Esta API está diseñada para ser eficiente, escalable y segura, implementando prácticas modernas como JWT para la autenticación, control de acceso basado en roles, y un sistema modular desacoplado.
No es perfecto pero es una base sólida

## Requisitos

- Node.js >= 14.x
- npm >= 6.x
- PostgreSQL

## Instalación

Clona el repositorio y ejecuta el siguiente comando para instalar las dependencias:

```
npm install
```

## Configuración

Antes de iniciar la aplicación, asegúrate de configurar las variables de entorno. Crea un archivo `.env` en la raíz del proyecto y define las siguientes variables (modifica según sea necesario):

```
# Variables para la base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=Usuario
DB_PASSWORD=Contraseña
DB_NAME=nombre-db

# Variables de tamaño de imágenes
IMAGE_LARGE_WIDTH=1024
IMAGE_MEDIUM_WIDTH=512
IMAGE_SMALL_WIDTH=256

# Token para JWT
JWT_SECRET_KEY=miClaveSuperSecreta123

# Configuración del estado de la aplicación
NODE_ENV=development/production
```

## Scripts Disponibles

En el archivo `package.json`, encontrarás varios scripts útiles para el desarrollo y despliegue:

- `build`: Compila el proyecto usando el compilador de NestJS.
- `start`: Inicia la aplicación en modo producción.
- `start:dev`: Inicia la aplicación en modo desarrollo con recarga automática.
- `start:debug`: Inicia la aplicación en modo debug.
- `lint`: Ejecuta ESLint y corrige los errores de estilo de código automáticamente.
- `seed`: Ejecuta el script para poblar la base de datos con datos iniciales de roles (Usuario, Profesional y Admin). Al iniciar el proyecto se ejecuta solo y si no están los roles los crea Para una mayor integridad

## Uso de TypeORM

Este proyecto utiliza **TypeORM** para la interacción con la base de datos PostgreSQL. Asegúrate de configurar tu conexión correctamente en las variables de entorno. Para realizar migraciones, puedes usar los comandos de TypeORM:

```
npm run typeorm migration:generate -- -n NombreDeLaMigración
npm run typeorm migration:run
```

## Versionado

El proyecto utiliza una estrategia de **doble versionado** para garantizar la flexibilidad en la actualización y prueba de nuevas versiones de la API sin afectar los endpoints existentes.

1. **Global Prefix**: Todas las rutas de la API están precedidas por un prefijo global `/api`, lo que permite mantener una estructura organizada y clara para todas las rutas del backend.
2. **Versioning**: Además del prefijo global, se implementa un sistema de versionado en las rutas utilizando el esquema `/v{número_de_versión}`. Este enfoque permite que múltiples versiones de la API coexistan, permitiendo probar nuevas funcionalidades o realizar cambios sin romper la compatibilidad con versiones anteriores.

#### Ejemplo de Rutas

- **Versión 1**: `/api/v1/usuarios`  
   Esta ruta corresponde a la primera versión de la API.
- **Versión 2**: `/api/v2/usuarios`  
   Esta ruta puede contener nuevas funcionalidades o mejoras sobre la versión anterior.

#### Ventajas del Doble Versionado

- **Compatibilidad a largo plazo**: Los clientes que dependen de versiones anteriores pueden seguir utilizando esas versiones sin que se vean afectados por cambios o mejoras que se implementen en versiones más recientes.
- **Pruebas sin interferencia**: Las nuevas versiones se pueden desplegar y probar en paralelo con las versiones estables, reduciendo el riesgo de interferir con los usuarios actuales.

#### Uso

Por defecto, el prefijo global `/api` se agrega automáticamente a todas las rutas, y puedes especificar la versión que deseas usar accediendo a rutas como `/api/v1/` o `/api/v2/`.

## Autenticación y Autorización

El sistema de autenticación utiliza **JWT** con tokens de acceso y refresh para manejar la sesión de los usuarios. Además, se implementa un control de acceso basado en roles (usuario, profesional, admin) que asegura que solo los usuarios autorizados puedan acceder a ciertos recursos.

### Endpoints Principales:

- `/auth/login`: Inicia sesión y devuelve un token JWT.
- `/auth/refresh`: Renueva el token de acceso.
- `/auth/logout`: Cierra la sesión e invalida el refresh token.

### Sistema de Roles

El sistema implementa control de acceso basado en roles, lo que permite gestionar el acceso a diferentes recursos de la aplicación. Existen tres roles principales: **Usuario**, que tiene acceso limitado a su propio perfil y funciones básicas; **Profesional**, con privilegios adicionales sobre funcionalidades específicas; y **Administrador**, que posee control total sobre el sistema, incluyendo la gestión de usuarios, roles y funcionalidades administrativas.

## Documentación API

Se utiliza **Swagger** para documentar automáticamente la API. Puedes acceder a la documentación interactiva en:

```
/docs
```

## Contribución

1. Haz un fork del proyecto.
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz un commit (`git commit -am 'Agrega nueva funcionalidad'`).
4. Sube tus cambios (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.
