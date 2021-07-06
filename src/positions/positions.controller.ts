import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
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
import { Position } from './schemas/position.schema';
import { SingleSaleDto } from '../sales/dto/list-all-sale.dto';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { ListAllPositionDto, SinglePositionDto } from './dto/list-all-position.dto';
import { PositionsService } from './positions.service';
import { SalesService } from '../sales/sales.service';
import { AuthService } from '../auth/auth.service';
import { Sale } from '../sales/schemas/sale.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AssignShiftGuard } from '../shifts/guards/assign-shift.guard';
import { ExistsPositionGuard } from './guards/exists-position.guard';
import { ExistsCustomerGuard } from '../customers/guards/exists-customer.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../base/enums/role.enum';
import { QueryParamsListDto } from '../base/dto/base-list.dto';
import { MongoDBFilter } from '../base/entities/mongodb-filter.entity';
import { Paginator, IPaginatorData } from '../base/entities/paginator.entity';
import { TransformInterceptor } from '../base/interceptors/response.interceptor';

@ApiTags('Positions')
@ApiConsumes('application/json')
@ApiProduces('application/json')
@UseGuards(JwtAuthGuard)
@UseGuards(AssignShiftGuard)
@UseInterceptors(TransformInterceptor)
@Controller('/api/v1/positions')
export class PositionsController {
  
  constructor(
    private positionsService: PositionsService,
    private salesService: SalesService,
    private authService: AuthService
  ) {}

  @Get()
  @ApiOkResponse({ type: ListAllPositionDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.All)
  async getAllAsync(@Query() params: QueryParamsListDto): Promise<IPaginatorData<Position>> {
    const filter = new MongoDBFilter(params)
      .setCriteria()
      .setPagination()
      .setSort()
      .build();

    const [positions, totalDocs] = await Promise.all([
      this.positionsService.getAllAsync(filter),
      this.positionsService.countDocsAsync(filter)
    ]);
  
    return new Paginator<Position>(positions, params, totalDocs).getPaginator();
  }

  @Get(':id')
  @ApiOkResponse({ type: SinglePositionDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.All)
  @UseGuards(ExistsPositionGuard)
  async getByIdAsync(@Param('id') id: string): Promise<Position> {
    return await this.positionsService.getByIdAsync(id);
  }

  @Post()
  @ApiOkResponse({ type: SinglePositionDto, isArray: false, status: 201 })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid model' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  async createAsync(@Body() position: CreatePositionDto): Promise<Position> {
    return await this.positionsService.createAsync(position);
  }

  @Post(':id/sales')
  @ApiOkResponse({ type: SingleSaleDto, isArray: false, status: 201 })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid model' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.All)
  @UseGuards(ExistsPositionGuard)
  @UseGuards(ExistsCustomerGuard)
  async createSaleAsync(
    @Body('customerId') customerId: string,
    @Param('id') id: string,
    @Headers('authorization') authorization: string
  ): Promise<Sale> {
    const token = authorization?.split(' ').pop();
    const { sub } = await this.authService.getPayload(token);
    const sale = await this.salesService.initializeSaleObject(customerId, id, sub);
    return await this.salesService.createAsync(sale);
  }

  @Patch(':id')
  @ApiOkResponse({ type: SinglePositionDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid model' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsPositionGuard)
  async updateByIdAsync(@Param('id') id: string, @Body() position: UpdatePositionDto): Promise<Position> {
    return await this.positionsService.updateOneByIdAsync(id, position);
  }

  @Delete(':id')
  @ApiOkResponse({ isArray: false, status: 204, description: 'No content' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsPositionGuard)
  @HttpCode(204)
  async deleteByIdAsync(@Param('id') id: string): Promise<Position> {
    return await this.positionsService.deleteOneByIdAsync(id);
  }
}