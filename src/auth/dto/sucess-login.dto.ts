import { ApiProperty } from "@nestjs/swagger";
import { SuccessResponseDto } from "../../base/dto/success-response.dto";

export class SuccessLoginDto extends SuccessResponseDto {

  @ApiProperty()
  public data: string;

}