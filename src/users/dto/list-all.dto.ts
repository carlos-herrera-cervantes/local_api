import { ApiProperty } from "@nestjs/swagger";
import { Role } from "../../base/enums/role.enum";
import { BaseListDto } from "../../base/dto/base-list.dto";
import { SuccessResponseDto } from "../../base/dto/success-response.dto";

export class SingleUserDto {

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ enum: Role, isArray: true })
  roles: Role[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

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
  docs: SingleUserDto[];

}

export class ListAllDto extends SuccessResponseDto {

  @ApiProperty()
  data: PartialAllDto;

}