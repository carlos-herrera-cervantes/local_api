import {
  ApiProduces,
  ApiOkResponse,
  ApiTags,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { Controller, Get, Param, UseGuards, UseInterceptors, Query } from '@nestjs/common';
import { PaymentMethod } from './schemas/paymentMethod.schema';
import { PaymentMethodService } from './paymentMethods.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExistsPaymentGuard } from './guards/exists-payment.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../base/enums/role.enum';
import { QueryParamsListDto } from '../base/dto/base-list.dto';
import { ListAllPaymentMethodDto, SinglePaymentMethodDto } from './dto/list-all-payment.dto';
import { MongoDBFilter } from '../base/entities/mongodb-filter.entity';
import { Paginator, IPaginatorData } from '../base/entities/paginator.entity';
import { TransformInterceptor } from '../base/interceptors/response.interceptor';

@ApiTags('Payment Methods')
@ApiProduces('application/json')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@Controller('/api/v1/payment-methods')
export class PaymentMethodController {

  constructor(private paymentMethodService: PaymentMethodService) {}

  @Get()
  @ApiOkResponse({ type: ListAllPaymentMethodDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.All)
  async getAllAsync(@Query() params: QueryParamsListDto): Promise<IPaginatorData<PaymentMethod>> {
    const filter = new MongoDBFilter(params)
      .setCriteria()
      .setPagination()
      .setSort()
      .build();
    
    const [payments, totalDocs] = await Promise.all([
      this.paymentMethodService.getAllAsync(filter),
      this.paymentMethodService.countDocsAsync(filter)
    ]);
  
    return new Paginator<PaymentMethod>(payments, params, totalDocs).getPaginator();
  }

  @Get(':id')
  @ApiOkResponse({ type: SinglePaymentMethodDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.All)
  @UseGuards(ExistsPaymentGuard)
  async getByIdAsync(@Param('id') id: string): Promise<PaymentMethod> {
    return await this.paymentMethodService.getByIdAsync(id);
  }

}