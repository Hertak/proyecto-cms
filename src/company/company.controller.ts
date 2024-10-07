import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ActiveUser } from '@/commons/decorators/active-user.decorator';
import { User } from '@/users/entities/user.entity';
import { Roles } from '@/commons/decorators/roles.decorator';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @Roles('Usuario')
  @ApiOperation({ summary: 'Crear una nueva compañía' })
  @ApiResponse({ status: 201, description: 'Compañía creada con éxito' })
  @ApiResponse({ status: 400, description: 'Errores de validación' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  async create(@Body() createCompanyDto: CreateCompanyDto, @ActiveUser() user: User, @UploadedFiles() files: Express.Multer.File[]) {
    const logoFile = files.find((file) => file.fieldname === 'logo');
    const coverFile = files.find((file) => file.fieldname === 'cover');
    return this.companyService.create(createCompanyDto, user, logoFile, coverFile);
  }

  @Get('companies-with-taxonomies')
  @ApiOperation({ summary: 'Obtener compañías con taxonomías asociadas' })
  async getCompaniesWithTaxonomies() {
    return this.companyService.getCompaniesWithTaxonomies();
  }
  @Get('taxonomies-with-companies')
  @ApiOperation({ summary: 'Obtener taxonomías con compañías asociadas' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Número de la página a obtener (opcional). Por defecto es 1.' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Cantidad de resultados por página (opcional). Por defecto es 10.' })
  @ApiQuery({
    name: 'search',
    required: false,
    example: 'companyName',
    description: 'Término de búsqueda opcional para filtrar compañías por nombre.',
  })
  @ApiQuery({ name: 'taxonomyId', required: false, example: 1, description: 'ID de la taxonomía para filtrar los resultados (opcional).' })
  @ApiQuery({ name: 'sortBy', required: false, example: 'company.name', description: 'Campo por el cual ordenar los resultados (opcional).' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Orden ascendente (ASC) o descendente (DESC) (opcional).' })
  async getTaxonomiesWithCompanies(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') searchTerm?: string,
    @Query('taxonomyId') taxonomyId?: string,
    @Query('sortBy') sortBy: string = 'company.name',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
  ): Promise<any> {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const taxonomyIdNumber = taxonomyId ? parseInt(taxonomyId, 10) : undefined;

    return this.companyService.getTaxonomiesWithCompanies(pageNumber, limitNumber, searchTerm, taxonomyIdNumber, sortBy, sortOrder);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una compañía por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la compañía que se desea obtener', example: 22 })
  async findOne(@Param('id') companyId: number) {
    return this.companyService.findOne(companyId);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar compañía' })
  @Roles('Usuario')
  @UseInterceptors(AnyFilesInterceptor())
  async updateCompany(
    @Param('id') companyId: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @UploadedFiles() files: Express.Multer.File[],
    @ActiveUser() activeUser: any,
  ) {
    const logoFile = files.find((file) => file.fieldname === 'logo');
    const coverFile = files.find((file) => file.fieldname === 'cover');
    const isAdmin = activeUser.roles.includes('Admin');
    return this.companyService.updateCompany(companyId, updateCompanyDto, activeUser.id, isAdmin, logoFile, coverFile);
  }
  @Delete(':id')
  @Roles('Usuario')
  @ApiOperation({ summary: 'Eliminar una compañía por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la compañía que se desea eliminar', example: 22 })
  async removeCompany(@Param('id') companyId: number, @ActiveUser() activeUser: any) {
    const isAdmin = activeUser.roles.includes('Admin');
    return this.companyService.removeCompany(companyId, activeUser.id, isAdmin);
  }
}
