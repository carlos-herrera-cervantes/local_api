import { ApiProperty } from "@nestjs/swagger";
import { SuccessResponseDto } from "../../base/dto/success-response.dto";
import { BaseListDto } from "../../base/dto/base-list.dto";

export class PartialPositionDto {

  @ApiProperty()
  readonly status: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly number: number;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

}

export class PartialAllPositionDto extends BaseListDto {

  @ApiProperty({
    example: [
      {
        status: '200',
        name: 'North',
        number: 1,
        updateAt: '2021-04-21T02:12:39.017Z',
        createdAt: '2021-04-21T02:12:39.017Z'
      }
    ]
  })
  readonly docs: PartialPositionDto[];

}

export class SinglePositionDto extends SuccessResponseDto {

  @ApiProperty()
  readonly data: PartialPositionDto;

}

export class ListAllPositionDto extends SuccessResponseDto {

  @ApiProperty()
  readonly data: PartialAllPositionDto;

}