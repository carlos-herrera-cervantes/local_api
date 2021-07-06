import { ApiProperty } from "@nestjs/swagger";
import { SuccessResponseDto } from "src/base/dto/success-response.dto";
import { BaseListDto } from "../../base/dto/base-list.dto";

export class PartialProductDto {

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty()
  readonly price: number;

  @ApiProperty()
  readonly pricePublic: number;

  @ApiProperty()
  readonly type: string;

  @ApiProperty()
  readonly taxes: string[];

  @ApiProperty()
  readonly measurementUnit: string;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

}

export class PartialAllProductDto extends BaseListDto {

  @ApiProperty({
    example: [
      {
        name: 'Test',
        description: 'Test description',
        price: 10,
        pricePublic: 18,
        taxes: [],
        measurementUnit: '607f97c82f0e153ed032a010',
        type: 'Test',
        createdAt: '2021-01-14T04:50:02.398Z',
        updatedAt: '2021-01-14T04:50:02.398Z'
      }
    ]
  })
  readonly docs: PartialProductDto[];

}

export class SingleProductDto extends SuccessResponseDto {

  @ApiProperty()
  readonly data: PartialProductDto;

}

export class ListAllProductDto extends SuccessResponseDto {

  @ApiProperty()
  readonly data: PartialAllProductDto;

}