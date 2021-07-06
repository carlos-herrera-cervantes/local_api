import { ApiProperty } from "@nestjs/swagger";
import { SuccessResponseDto } from "../../base/dto/success-response.dto";
import { BaseListDto } from "../../base/dto/base-list.dto";

export class PartialShiftDto {

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly order: number;

  @ApiProperty()
  readonly startTime: string;

  @ApiProperty()
  readonly endTime: string;

  @ApiProperty()
  readonly monday: string[];

  @ApiProperty()
  readonly tuesday: string[];

  @ApiProperty()
  readonly wednesday: string[];

  @ApiProperty()
  readonly thursday: string[];

  @ApiProperty()
  readonly friday: string[];

  @ApiProperty()
  readonly saturday: string[];

  @ApiProperty()
  readonly sunday: string[];

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

}

export class PartialAllShiftDto extends BaseListDto {

  @ApiProperty({
    example: [
      {
        name: 'Morning',
        startTime: '07:00:00',
        endTime: '11:59:59',
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  })
  readonly docs: PartialShiftDto[];

}

export class SingleShiftDto extends SuccessResponseDto {

  @ApiProperty()
  readonly data: PartialShiftDto;

}

export class ListAllShiftDto extends SuccessResponseDto {

  @ApiProperty()
  readonly data: PartialAllShiftDto;

}