import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { CollectsModule } from './collects/collects.module';
import { MeasurementsModule } from './measurementUnits/measurements.module';
import { PaymentMethodModule } from './paymentMethods/paymentMethods.module';
import { PaymentTransactionModule } from './paymentTransactions/paymentTransactions.module';
import { PositionsModule } from './positions/positions.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { ShiftsModule } from './shifts/shifts.module';
import { StationsModule } from './stations/stations.module';
import { TaxesModule } from './taxes/taxes.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FirebaseModule } from './firebase/firebase.module';
import { RolesGuard } from './auth/guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb://${configService.get<string>('DB_HOST')}/${configService.get<string>('DB_NAME')}`
      }),
      inject: [ConfigService]
    }),
    UsersModule,
    CustomersModule,
    CollectsModule,
    MeasurementsModule,
    PaymentMethodModule,
    PaymentTransactionModule,
    PositionsModule,
    ProductsModule,
    SalesModule,
    ShiftsModule,
    StationsModule,
    TaxesModule,
    AuthModule,
    FirebaseModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ],
})
export class AppModule {}