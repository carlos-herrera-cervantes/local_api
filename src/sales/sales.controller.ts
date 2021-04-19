import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Headers,
  HttpCode
} from '@nestjs/common';
import { Sale } from './schemas/sale.schema';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { SalesService } from './sales.service';
import { ShiftsService } from '../shifts/shifts.service';
import { AuthService } from '../auth/auth.service';
import { DateService } from '../dates/dates.service';
import { PaymentTransactionService } from '../paymentTransactions/paymentTransactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AssignShiftGuard } from '../shifts/guards/assign-shift.guard';
import { CalculateTotalGuard } from './guards/calculate-total.guard';
import { PayGuard } from './guards/pay.guard';
import { CloseGuard } from './guards/close.guard';
import { AddProductGuard } from './guards/add-product.guard';
import { ExistsSaleGuard } from './guards/exists-sale.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../base/enums/role.enum';
import { IMongoDBFilter } from '../base/entities/mongodb-filter.entity';
import { PaymentTransaction } from '../paymentTransactions/schemas/paymentTransaction.schema';

@UseGuards(JwtAuthGuard)
@UseGuards(AssignShiftGuard)
@Controller('/api/v1/sales')
export class SalesController {
  
  constructor(
    private salesService: SalesService,
    private shiftsService: ShiftsService,
    private authService: AuthService,
    private dateService: DateService,
    private paymentTransactionService: PaymentTransactionService
  ) {}

  @Get()
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  async getAllAsync(): Promise<Sale[]> {
    return await this.salesService.getAllAsync();
  }

  @Get(':id')
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsSaleGuard)
  async getByIdAsync(@Param() params): Promise<Sale> {
    return await this.salesService.getByIdAsync(params.id);
  }

  @Get('positions/:id')
  @Roles(Role.SuperAdmin, Role.StationAdmin, Role.Employee)
  async getByUserId(
    @Headers('authorization') authorization : string,
    @Param('id') id: string,
  ): Promise<Sale> {
    const token = authorization?.split(' ').pop();
    const { sub } = await this.authService.getPayload(token);

    const shifts = await this.shiftsService.getAllAsync();
    const localDate = this.dateService.getLocalDate();

    const current = this.shiftsService.getCurrent(shifts, localDate);
    const { start, end } = this.shiftsService.parseDateUTC(current);

    const filter = {
      criteria: {
        createdAt: {
          $gte: start,
          $lte: end
        },
        user: sub,
        status: {
          $in: ['202', '203', '200']
        },
        position: id
      }
    } as IMongoDBFilter;

    return await this.salesService.getAllAsync(filter);
  }

  @Patch(':id')
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsSaleGuard)
  async updateByIdAsync(@Param() params, @Body() sale: UpdateSaleDto): Promise<Sale> {
    return await this.salesService.updateOneByIdAsync(params.id, sale);
  }

  @Patch(':id/products')
  @Roles(Role.SuperAdmin, Role.StationAdmin, Role.Employee)
  @UseGuards(ExistsSaleGuard)
  @UseGuards(AddProductGuard)
  async addProductAsync(@Param('id') id : string, @Body() sale: UpdateSaleDto): Promise<Sale> {
    return await this.salesService.updateOneByIdAsync(id, { ...sale, status: '202' });
  }

  @Patch(':id/calculate-total')
  @Roles(Role.SuperAdmin, Role.StationAdmin, Role.Employee)
  @UseGuards(ExistsSaleGuard)
  @UseGuards(CalculateTotalGuard)
  async calculateTotalAsync(@Param('id') id: string): Promise<Sale> {
    const sale = await this.salesService.getByIdAsync(id);
    const total = await this.salesService.calculateTotalAsync(sale);
    return await this.salesService.updateOneByIdAsync(id, total);
  }

  @Patch(':id/pay')
  @Roles(Role.SuperAdmin, Role.StationAdmin, Role.Employee)
  @UseGuards(ExistsSaleGuard)
  @UseGuards(PayGuard)
  async payAsync(
    @Param('id') id: string,
    @Body('paymentMethodId') paymentMethodId: any
  ): Promise<Sale> {
    const sale = await this.salesService.getByIdAsync(id) as Sale;
    const payment = {
      quantity: sale?.total,
      paymentMethod: paymentMethodId
    } as PaymentTransaction;
    const created = await this.paymentTransactionService.createAsync(payment);

    sale.paymentTransaction = created._id;
    sale.status = '203';

    return await this.salesService.saveAsync(sale);
  }

  @Patch(':id/close')
  @Roles(Role.SuperAdmin, Role.StationAdmin, Role.Employee)
  @UseGuards(ExistsSaleGuard)
  @UseGuards(CloseGuard)
  async closeAsync(
    @Headers('authorization') authorization: string,
    @Param('id') id: string
  ): Promise<Sale> {
    const token = authorization?.split(' ').pop();
    const { sub } = await this.authService.getPayload(token);

    const [sale, saleCloud] = await Promise.all([
      this.salesService.getByIdAsync(id),
      this.salesService.createCloudStructure(id)
    ]);
    sale.status = '201';

    await Promise.all([
      this.salesService.chargeMoneyToUser(sub, saleCloud),
      this.salesService.saveAsync(sale)
    ]);

    return sale;
  }

  @Delete(':id')
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsSaleGuard)
  @HttpCode(204)
  async deleteByIdAsync(@Param() params): Promise<Sale> {
    return await this.salesService.deleteOneByIdAsync(params.id);
  }
}