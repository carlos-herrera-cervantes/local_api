import { ApiProperty } from "@nestjs/swagger";
import { PagerDto } from "./pager.dto";

export class BaseListDto {

  @ApiProperty()
  paginator: PagerDto;

}

export class QueryParamsBaseDto {

  @ApiProperty({ required: false })
  page: number;

  @ApiProperty({ required: false })
  pageSize: number;

  @ApiProperty({ required: false })
  sort: string;

  @ApiProperty({ required: false })
  filter: string;

}

export class QueryParamsListDto extends QueryParamsBaseDto {
  @ApiProperty({ required: false })
  relation: string;
}

export class QueryParamsSingleSourceDto {
  @ApiProperty({ required: false })
  relation: string;
}