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
  Query,
  Headers,
  HttpCode
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
import { Shift } from './schemas/shift.schema';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ListAllShiftDto, SingleShiftDto } from './dto/list-all-shift.dto';
import { SingleCutTurnDto } from './dto/cut-turn.dto';
import { ShiftsService } from './shifts.service';
import { AuthService } from '../auth/auth.service';
import { DateService } from '../dates/dates.service';
import { SalesService } from '../sales/sales.service';
import { CollectMoneyService } from '../collects/collects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExistsShiftGuard } from './guards/exists-shift.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../base/enums/role.enum';
import { MongoDBFilter } from '../base/entities/mongodb-filter.entity';
import { Paginator, IPaginatorData } from '../base/entities/paginator.entity';
import { TransformInterceptor } from '../base/interceptors/response.interceptor';
import { QueryParamsListDto } from 'src/base/dto/base-list.dto';

@ApiTags('Shifts')
@ApiConsumes('application/json')
@ApiProduces('application/json')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@Controller('/api/v1/shifts')
export class ShiftsController {
  
  constructor(
    private shiftsService: ShiftsService,
    private authService: AuthService,
    private collectService: CollectMoneyService,
    private dateService: DateService,
    private salesService: SalesService
  ) {}

  @Get()
  @ApiOkResponse({ type: ListAllShiftDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  async getAllAsync(@Query() params: QueryParamsListDto): Promise<IPaginatorData<Shift>> {
    const filter = new MongoDBFilter(params)
      .setCriteria()
      .setPagination()
      .setSort()
      .build();

    const [shifts, totalDocs] = await Promise.all([
      this.shiftsService.getAllAsync(filter),
      this.shiftsService.countDocsAsync(filter)
    ]);
  
    return new Paginator<Shift>(shifts, params, totalDocs).getPaginator();
  }

  @Get('cut')
  @ApiOkResponse({ type: SingleCutTurnDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.All)
  async cutAsync(
    @Query('previous') previous: boolean,
    @Headers('authorization') authorization: string
  ): Promise<any> {
    const token = authorization?.split(' ').pop();
    const { sub } = await this.authService.getPayload(token);
    const [shifts, _] = await Promise.all([
      this.shiftsService.getAllAsync(),
      this.collectService.collectAllAsync(sub)
    ]);

    const localDate = this.dateService.getLocalDate();
    const selected = previous ?
      this.shiftsService.getPrevious(shifts, localDate) :
      this.shiftsService.getCurrent(shifts, localDate);
    const utcIntervals = this.shiftsService.parseDateUTC(selected, previous);

    return await this.salesService.doReportAsync(utcIntervals, sub);
  }

  @Get(':id')
  @ApiOkResponse({ type: SingleShiftDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsShiftGuard)
  async getByIdAsync(@Param('id') id: string): Promise<Shift> {
    return await this.shiftsService.getByIdAsync(id);
  }

  @Post()
  @ApiOkResponse({ type: SingleShiftDto, isArray: false, status: 201 })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid model' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  async createAsync(@Body() shift: CreateShiftDto): Promise<Shift> {
    return await this.shiftsService.createAsync(shift);
  }

  @Patch(':id')
  @ApiOkResponse({ type: SingleShiftDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid model' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsShiftGuard)
  async updateByIdAsync(@Param('id') id: string, @Body() shift: UpdateShiftDto): Promise<Shift> {
    return await this.shiftsService.updateOneByIdAsync(id, shift);
  }

  @Patch(':id/add-user')
  @ApiOkResponse({ type: SingleShiftDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid model' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsShiftGuard)
  async addUserAsync(@Param('id') id: string, @Body() shift: UpdateShiftDto): Promise<Shift> {
    return await this.shiftsService.updateOneByIdAsync(id, shift);
  }

  @Delete(':id')
  @ApiOkResponse({ isArray: false, status: 204, description: 'No content' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsShiftGuard)
  @HttpCode(204)
  async deleteByIdAsync(@Param('id') id: string): Promise<Shift> {
    return await this.shiftsService.deleteOneByIdAsync(id);
  }
}