import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  HttpCode,
  Query
} from '@nestjs/common';
import {
  ApiProduces,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnprocessableEntityResponse
} from '@nestjs/swagger';
import { Tax } from './schemas/tax.schema';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { ListAllTaxDto, SingleTaxDto } from './dto/list-all-tax.dto';
import { TaxesService } from './taxes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExistsTaxGuard } from './guards/exists-tax.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../base/enums/role.enum';
import { QueryParamsListDto } from '../base/dto/base-list.dto';
import { MongoDBFilter } from '../base/entities/mongodb-filter.entity';
import { Paginator, IPaginatorData } from '../base/entities/paginator.entity';
import { TransformInterceptor } from '../base/interceptors/response.interceptor';

@ApiTags('Taxes')
@ApiConsumes('application/json')
@ApiProduces('application/json')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@Controller('/api/v1/taxes')
export class TaxesController {
  
  constructor(private taxesService: TaxesService) {}

  @Get()
  @ApiOkResponse({ type: ListAllTaxDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  async getAllAsync(@Query() params: QueryParamsListDto): Promise<IPaginatorData<Tax>> {
    const filter = new MongoDBFilter(params)
      .setCriteria()
      .setPagination()
      .setSort()
      .build();
    
    const [taxes, totalDocs] = await Promise.all([
      this.taxesService.getAllAsync(filter),
      this.taxesService.countDocsAsync(filter)
    ]);
  
    return new Paginator<Tax>(taxes, params, totalDocs).getPaginator();
  }

  @Get(':id')
  @ApiOkResponse({ type: SingleTaxDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsTaxGuard)
  async getByIdAsync(@Param('id') id: string): Promise<Tax> {
    return await this.taxesService.getByIdAsync(id);
  }

  @Post()
  @ApiOkResponse({ type: SingleTaxDto, isArray: false, status: 201 })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid model' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  async createAsync(@Body() tax: CreateTaxDto): Promise<Tax> {
    return await this.taxesService.createAsync(tax);
  }

  @Patch(':id')
  @ApiOkResponse({ type: SingleTaxDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid model' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsTaxGuard)
  async updateByIdAsync(@Param('id') id: string, @Body() tax: UpdateTaxDto): Promise<Tax> {
    return await this.taxesService.updateOneByIdAsync(id, tax);
  }

  @Delete(':id')
  @ApiOkResponse({ isArray: false, status: 204, description: 'No content' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsTaxGuard)
  @HttpCode(204)
  async deleteByIdAsync(@Param('id') id: string): Promise<Tax> {
    return await this.taxesService.deleteOneByIdAsync(id);
  }
}