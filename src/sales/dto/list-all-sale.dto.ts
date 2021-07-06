import { ApiProperty } from "@nestjs/swagger";
import { SuccessResponseDto } from "../../base/dto/success-response.dto";
import { BaseListDto } from "../../base/dto/base-list.dto";

class ProductSaleDto {

  @ApiProperty()
  readonly product: string;

  @ApiProperty()
  readonly quantity: number;

}

export class PartialSaleDto {

  @ApiProperty()
  readonly consecutive: number;

  @ApiProperty()
  readonly station: string;

  @ApiProperty()
  readonly folio: string;

  @ApiProperty()
  readonly status: boolean;

  @ApiProperty()
  readonly vat: number;

  @ApiProperty()
  readonly subtotal: number;

  @ApiProperty()
  readonly total: number;

  @ApiProperty()
  readonly tip: number;

  @ApiProperty()
  readonly totalLetters: number;

  @ApiProperty()
  readonly paymentTransaction: string[];

  @ApiProperty()
  readonly position: string;

  @ApiProperty()
  readonly products: ProductSaleDto[];

  @ApiProperty()
  readonly user: string;

  @ApiProperty()
  readonly customer: string;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

}

export class PartialAllSaleDto extends BaseListDto {

  @ApiProperty({
    example: [
      {
        consecutive: 1,
        customer: '607f8b53104a85ef420ef7ea',
        position: '607f8a85ad51923a83f0ae54',
        user: '607f7e13725ffc34e0f72ecd',
        station: '5f947448c83ad110d92cde25',
        folio: 'RE1620670409532',
        status: '200',
        total: 0,
        subtotal: 0,
        vat: 0,
        tip: 0,
        totalLetters: '',
        paymentTransaction: [],
        products: [],
        updateAt: '2021-05-10T18:13:19.000Z',
        createdAt: '2021-05-10T18:13:19.000Z'
      }
    ]
  })
  readonly docs: PartialSaleDto[];

}

export class SingleSaleDto extends SuccessResponseDto {

  @ApiProperty()
  readonly data: PartialSaleDto;

}

export class ListAllSaleDto extends SuccessResponseDto {

  @ApiProperty()
  readonly data: PartialAllSaleDto;

}