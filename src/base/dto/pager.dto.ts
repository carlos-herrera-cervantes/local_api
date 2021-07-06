import { ApiProperty } from "@nestjs/swagger";

export class PagerDto {

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  remainingDocuments: number;

  @ApiProperty()
  totalDocuments: number;

}