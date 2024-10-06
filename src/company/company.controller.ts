import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, UploadedFile } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CreateCompanyTaxService } from './create-company-tax.service';
import { CreateCompanyTaxonomyDto } from './dto/create-company-tax.dto';
import { CompanyTaxonomy } from './entities/company-taxonomy.entity';
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnyFilesInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ActiveUser } from '@/commons/decorators/active-user.decorator';
import { User } from '@/users/entities/user.entity';
import { Roles } from '@/commons/decorators/roles.decorator';

@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly createCompanyTaxService: CreateCompanyTaxService,
  ) {}

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

  @Post('taxonomy')
  async createTax(@Body() createCompanyTaxonomyDto: CreateCompanyTaxonomyDto): Promise<CompanyTaxonomy> {
    return this.createCompanyTaxService.create(createCompanyTaxonomyDto);
  }

  @Get()
  findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(+id, updateCompanyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.remove(+id);
  }
}
