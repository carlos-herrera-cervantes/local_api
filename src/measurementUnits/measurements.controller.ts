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
import { MeasurementUnit } from './schemas/measurementUnit.schema';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';
import { ListAllMeasurementDto, SingleMeasurementDto } from './dto/list-all-measurement.dto';
import { MeasurementsService } from './measurements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExistsMeasurementGuard } from './guards/exists-measurement.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../base/enums/role.enum';
import { QueryParamsListDto } from '../base/dto/base-list.dto';
import { MongoDBFilter } from '../base/entities/mongodb-filter.entity';
import { Paginator, IPaginatorData } from '../base/entities/paginator.entity';
import { TransformInterceptor } from '../base/interceptors/response.interceptor';

@ApiTags('Measurement Units')
@ApiConsumes('application/json')
@ApiProduces('application/json')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@Controller('/api/v1/measurement-units')
export class MeasurementsController {
  
  constructor(private measurementsService: MeasurementsService) {}

  @Get()
  @ApiOkResponse({ type: ListAllMeasurementDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  async getAllAsync(@Query() params: QueryParamsListDto): Promise<IPaginatorData<MeasurementUnit>> {
    const filter = new MongoDBFilter(params)
      .setCriteria()
      .setPagination()
      .setSort()
      .build();

    const [measurements, totalDocs] = await Promise.all([
      this.measurementsService.getAllAsync(filter),
      this.measurementsService.countDocsAsync(filter)
    ]);
  
    return new Paginator<MeasurementUnit>(measurements, params, totalDocs).getPaginator();
  }

  @Get(':id')
  @ApiOkResponse({ type: SingleMeasurementDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsMeasurementGuard)
  async getByIdAsync(@Param('id') id: string): Promise<MeasurementUnit> {
    return await this.measurementsService.getByIdAsync(id);
  }

  @Post()
  @ApiOkResponse({ type: SingleMeasurementDto, isArray: false, status: 201 })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid model' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  async createAsync(@Body() measurement: CreateMeasurementDto): Promise<MeasurementUnit> {
    return await this.measurementsService.createAsync(measurement);
  }

  @Patch(':id')
  @ApiOkResponse({ type: SingleMeasurementDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid model' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsMeasurementGuard)
  async updateByIdAsync(@Param('id') id: string, @Body() measurement: UpdateMeasurementDto): Promise<MeasurementUnit> {
    return await this.measurementsService.updateOneByIdAsync(id, measurement);
  }

  @Delete(':id')
  @ApiOkResponse({ isArray: false, status: 204, description: 'No content' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsMeasurementGuard)
  @HttpCode(204)
  async deleteByIdAsync(@Param('id') id: string): Promise<MeasurementUnit> {
    return await this.measurementsService.deleteOneByIdAsync(id);
  }
}