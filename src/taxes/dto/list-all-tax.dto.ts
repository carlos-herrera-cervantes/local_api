import { ApiProperty } from "@nestjs/swagger";
import { SuccessResponseDto } from "../../base/dto/success-response.dto";
import { BaseListDto } from "../../base/dto/base-list.dto";

export class PartialTaxDto {

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty()
  readonly status: boolean;

  @ApiProperty()
  readonly percentage: number;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

}

export class PartialAllTaxDto extends BaseListDto {

  @ApiProperty({
    example: [
      {
        name: 'IVA',
        description: 'Purchase tax',
        status: true,
        percentage: 0.16,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  })
  readonly docs: PartialTaxDto[];

}

export class SingleTaxDto extends SuccessResponseDto {

  @ApiProperty()
  readonly data: PartialTaxDto;

}

export class ListAllTaxDto extends SuccessResponseDto {

  @ApiProperty()
  readonly data: PartialAllTaxDto;
;
}