import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
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
import { Product } from './schemas/product.schema';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListAllProductDto, SingleProductDto } from './dto/list-all-product.dto';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../base/enums/role.enum';
import { QueryParamsListDto } from '../base/dto/base-list.dto';
import { MongoDBFilter } from '../base/entities/mongodb-filter.entity';
import { Paginator, IPaginatorData } from '../base/entities/paginator.entity';
import { TransformInterceptor } from '../base/interceptors/response.interceptor';

@ApiTags('Products')
@ApiConsumes('application/json')
@ApiProduces('application/json')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@Controller('/api/v1/products')
export class ProductsController {

  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOkResponse({ type: ListAllProductDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.All)
  async getAllAsync(@Query() params: QueryParamsListDto): Promise<IPaginatorData<Product>> {
    const filter = new MongoDBFilter(params)
      .setRelation()
      .setCriteria()
      .setPagination()
      .setSort()
      .build();

    const [products, totalDocs] = await Promise.all([
      this.productsService.getAllAsync(filter),
      this.productsService.countDocsAsync(filter)
    ]);
  
    return new Paginator<Product>(products, params, totalDocs).getPaginator();
  }

  @Get(':id')
  @ApiOkResponse({ type: SingleProductDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.All)
  async getByIdAsync(@Param('id') id: string): Promise<Product> {
    return await this.productsService.getByIdAsync(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: SingleProductDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid model' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  async updateByIdAsync(@Param('id') id: string, @Body() product: UpdateProductDto): Promise<Product> {
    return await this.productsService.updateOneByIdAsync(id, product);
  }

}