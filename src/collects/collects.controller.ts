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
  Headers,
  Logger,
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
import { CollectMoney } from './schemas/collect.schema';
import { CreateCollectDto } from './dto/create-collect.dto';
import { UpdateCollectDto } from './dto/update-collect.dto';
import { ListAllCollectDto, SingleCollectDto } from './dto/list-all-collect.dto';
import { CollectMoneyService } from './collects.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../base/enums/role.enum';
import { QueryParamsListDto } from '../base/dto/base-list.dto';
import { MongoDBFilter } from '../base/entities/mongodb-filter.entity';
import { Paginator, IPaginatorData } from '../base/entities/paginator.entity';
import { TransformInterceptor } from '../base/interceptors/response.interceptor';
import { successCreatedCollectEvent } from './logger/index';

@ApiTags('Collects')
@ApiConsumes('application/json')
@ApiProduces('application/json')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@Controller('/api/v1/collects')
export class CollectsController {
  private readonly logger = new Logger(CollectsController.name);

  constructor(
    private collectsService: CollectMoneyService,
    private authService: AuthService
  ) {}

  @Get()
  @ApiOkResponse({ type: ListAllCollectDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  async getAllAsync(@Query() params: QueryParamsListDto): Promise<IPaginatorData<CollectMoney>> {
    const filter = new MongoDBFilter(params)
      .setCriteria()
      .setPagination()
      .setSort()
      .build();

    const [collects, totalDocs] = await Promise.all([
      this.collectsService.getAllAsync(filter),
      this.collectsService.countDocsAsync(filter)
    ]);

    return new Paginator<CollectMoney>(collects, params, totalDocs).getPaginator();
  }

  @Get('me')
  @ApiOkResponse({ type: ListAllCollectDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.All)
  async getMeAsync(
    @Headers('authorization') authorization: string,
    @Query() params: QueryParamsListDto
  ): Promise<IPaginatorData<CollectMoney>> {
    const token = authorization?.split(' ').pop();
    const { sub } = await this.authService.getPayload(token);
    const filter = new MongoDBFilter(params)
      .setCriteria()
      .setPagination()
      .setSort()
      .build();

    filter.criteria['user'] = sub;

    const [collects, totalDocs] = await Promise.all([
      this.collectsService.getAllAsync(filter),
      this.collectsService.countDocsAsync(filter)
    ]);

    return new Paginator<CollectMoney>(collects, params, totalDocs).getPaginator();
  }

  @Get(':id')
  @ApiOkResponse({ type: SingleCollectDto, isArray: false })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  async getByIdAsync(@Param('id') id: string): Promise<CollectMoney> {
    return await this.collectsService.getByIdAsync(id);
  }

  @Post()
  @ApiOkResponse({ type: SingleCollectDto, isArray: false, status: 201 })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid model' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  async createAsync(@Body() collect: CreateCollectDto): Promise<CollectMoney> {
    const created = await this.collectsService.createAsync(collect);
    this.logger.log(successCreatedCollectEvent(collect.type, collect.amount, collect.user));
    
    return created;
  }

  @Patch(':id')
  @ApiOkResponse({ type: SingleCollectDto, isArray: false })
  @ApiUnprocessableEntityResponse({ description: 'Invalid model' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin)
  async updateByIdAsync(@Param('id') id: string, @Body() collect: UpdateCollectDto): Promise<CollectMoney> {
    return await this.collectsService.updateOneByIdAsync(id, collect);
  }

  @Delete(':id')
  @ApiOkResponse({ isArray: false, status: 204, description: 'No content' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin)
  @HttpCode(204)
  async deleteByIdAsync(@Param('id') id: string): Promise<CollectMoney> {
    return await this.collectsService.deleteOneByIdAsync(id);
  }
}