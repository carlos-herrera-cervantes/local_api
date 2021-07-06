import { ApiProperty } from "@nestjs/swagger";
import { SuccessResponseDto } from "../../base/dto/success-response.dto";

class LabelDto {

  @ApiProperty()
  readonly label: string;

  @ApiProperty()
  readonly amount: number;

}

export class PartialCutTurnDto {

  @ApiProperty()
  readonly products: LabelDto[];

  @ApiProperty()
  readonly payments: LabelDto[];

}

export class SingleCutTurnDto extends SuccessResponseDto {

  @ApiProperty()
  readonly data: PartialCutTurnDto;

}