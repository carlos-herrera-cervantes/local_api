import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  HttpCode,
  Headers,
  Query
} from '@nestjs/common';
import {
  ApiProduces,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnprocessableEntityResponse
} from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../base/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExistsUserGuard } from './guards/exists-user.guard';
import { MongoDBFilter } from '../base/entities/mongodb-filter.entity';
import { Paginator, IPaginatorData } from '../base/entities/paginator.entity';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListAllUserDto, SingleUserDto } from './dto/list-all-user.dto';
import { QueryParamsListDto } from '../base/dto/base-list.dto';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { TransformInterceptor } from '../base/interceptors/response.interceptor';

@ApiTags('Users')
@ApiConsumes('application/json')
@ApiProduces('application/json')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@Controller('/api/v1/users')
export class UsersController {
  
  constructor(
    private usersService: UsersService,
    private authService: AuthService
  ) {}

  @Get()
  @ApiOkResponse({ type: ListAllUserDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  async getAllAsync(@Query() params: QueryParamsListDto): Promise<IPaginatorData<User>> {
    const filter = new MongoDBFilter(params).setCriteria().setPagination().setSort().build();
    const [users, totalDocs] = await Promise.all([
      this.usersService.getAllAsync(filter),
      this.usersService.countDocsAsync(filter)
    ]);

    return new Paginator<User>(users, params, totalDocs).getPaginator();
  }

  @Get('me')
  @ApiOkResponse({ type: SingleUserDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.All)
  async getMeAsync(@Headers('authorization') authorization : string): Promise<User> {
    const token = authorization?.split(' ').pop();
    const { sub } = await this.authService.getPayload(token);
    return await this.usersService.getByIdAsync(sub);
  }

  @Get(':id')
  @ApiOkResponse({ type: SingleUserDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsUserGuard)
  async getByIdAsync(@Param('id') id: string): Promise<User> {
    return await this.usersService.getByIdAsync(id);
  }

  @Post()
  @ApiOkResponse({ type: SingleUserDto, isArray: false, status: 201 })
  @ApiUnprocessableEntityResponse({ description: 'Invalid model' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  async createAsync(@Body() user: CreateUserDto): Promise<User> {
    return await this.usersService.createAsync(user);
  }

  @Patch(':id')
  @ApiOkResponse({ type: SingleUserDto, isArray: false })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid model' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin, Role.StationAdmin)
  @UseGuards(ExistsUserGuard)
  async updateByIdAsync(@Param('id') id: string, @Body() user: UpdateUserDto): Promise<User> {
    return await this.usersService.updateOneByIdAsync(id, user);
  }

  @Delete(':id')
  @ApiOkResponse({ isArray: false, status: 204, description: 'No content' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Roles(Role.SuperAdmin)
  @UseGuards(ExistsUserGuard)
  @HttpCode(204)
  async deleteByIdAsync(@Param('id') id: string): Promise<User> {
    return await this.usersService.deleteOneByIdAsync(id);
  }
}