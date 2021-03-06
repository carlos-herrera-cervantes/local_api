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
  HttpCode
} from '@nestjs/common';
import { MeasurementUnit } from './schemas/measurementUnit.schema';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';
import { MeasurementsService } from './measurements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExistsMeasurementGuard } from './guards/exists-measurement.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../base/enums/role.enum';
import { CustomQueryParams, QueryParams } from '../base/entities/query-params.entity';
import { MongoDBFilter } from '../base/entities/mongodb-filter.entity';
import { Paginator, IPaginatorData } from '../base/entities/paginator.entity';
import { TransformInterceptor } from '../base/interceptors/response.interceptor';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Measurement Units')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@Controller('/api/v1/measurement-units')
export class MeasurementsController {
  
  constructor(private measurementsService: MeasurementsService) {}

  @Get()
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  async getAllAsync(@CustomQueryParams() params: QueryParams): Promise<IPaginatorData<MeasurementUnit>> {
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
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsMeasurementGuard)
  async getByIdAsync(@Param() params): Promise<MeasurementUnit> {
    return await this.measurementsService.getByIdAsync(params.id);
  }

  @Post()
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  async createAsync(@Body() measurement: CreateMeasurementDto): Promise<MeasurementUnit> {
    return await this.measurementsService.createAsync(measurement);
  }

  @Patch(':id')
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsMeasurementGuard)
  async updateByIdAsync(@Param() params, @Body() measurement: UpdateMeasurementDto): Promise<MeasurementUnit> {
    return await this.measurementsService.updateOneByIdAsync(params.id, measurement);
  }

  @Delete(':id')
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsMeasurementGuard)
  @HttpCode(204)
  async deleteByIdAsync(@Param() params): Promise<MeasurementUnit> {
    return await this.measurementsService.deleteOneByIdAsync(params.id);
  }
}