import { ApiProperty } from "@nestjs/swagger";
import { SuccessResponseDto } from "../../base/dto/success-response.dto";
import { BaseListDto } from "../../base/dto/base-list.dto";

export class PartialPaymentMethodDto {

  @ApiProperty()
  readonly key: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty()
  readonly status: boolean;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

}

export class PartialAllPaymentMethodDto extends BaseListDto {

  @ApiProperty({
    example: [
      {
        key: '01',
        name: 'CASH',
        description: 'Cash payment',
        status: true,
        createdAt: '2021-01-16T23:05:32.117Z',
        updatedAt: '2021-01-16T23:05:32.117Z'
      }
    ]
  })
  readonly docs: PartialPaymentMethodDto[];

}

export class SinglePaymentMethodDto extends SuccessResponseDto {

  @ApiProperty()
  readonly data: PartialPaymentMethodDto;

}

export class ListAllPaymentMethodDto extends SuccessResponseDto {

  @ApiProperty()
  readonly data: PartialAllPaymentMethodDto;

}