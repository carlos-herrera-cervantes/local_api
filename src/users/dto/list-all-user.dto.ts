import { ApiProperty } from "@nestjs/swagger";
import { Role } from "../../base/enums/role.enum";
import { BaseListDto } from "../../base/dto/base-list.dto";
import { SuccessResponseDto } from "../../base/dto/success-response.dto";

export class PartialUserDto {

  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly firstName: string;

  @ApiProperty()
  readonly lastName: string;

  @ApiProperty({ enum: Role, isArray: true })
  readonly roles: Role[];

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

}

export class PartialAllDto extends BaseListDto {

  @ApiProperty({
    example: [
      { 
        email: 'demo@example.com',
        firstName: 'Demo',
        lastName: 'User',
        role: ['Employee'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  })
  readonly docs: PartialUserDto[];

}

export class SingleUserDto extends SuccessResponseDto {

  @ApiProperty()
  readonly data: PartialUserDto;

}

export class ListAllUserDto extends SuccessResponseDto {

  @ApiProperty()
  readonly data: PartialAllDto;

}