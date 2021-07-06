import { ApiProperty } from "@nestjs/swagger";
import { BaseListDto } from "src/base/dto/base-list.dto";
import { SuccessResponseDto } from "src/base/dto/success-response.dto";

export class PartialMeasurementDto {

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly short: string;

  @ApiProperty()
  readonly keySat: string;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

}

export class PartialAllMeasurementDto extends BaseListDto {

  @ApiProperty({
    example: [
      {
        name: 'LITER',
        short: 'L',
        keySat: 'LTR',
        updateAt: '2021-04-21T03:04:17.030Z',
        createdAt: '2021-04-21T03:04:17.030Z'
      }
    ]
  })
  readonly docs: PartialMeasurementDto[];

}

export class SingleMeasurementDto extends SuccessResponseDto {

  @ApiProperty()
  readonly data: PartialMeasurementDto;

}

export class ListAllMeasurementDto extends SuccessResponseDto {

  @ApiProperty()
  readonly data: PartialAllMeasurementDto;

}