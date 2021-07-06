import { Controller, Logger, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { TransformInterceptor } from '../base/interceptors/response.interceptor';
import { successAuthEvent } from './logger/index';
import { SuccessLoginDto } from './dto/sucess-login.dto';
import {
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiConsumes
} from '@nestjs/swagger';

@ApiTags('Authentication')
@ApiConsumes('application/json')
@Controller('/api/v1/auth')
@UseInterceptors(TransformInterceptor)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    summary: 'User login',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {},
          example: {
            email: 'test@example.com',
            password: 'secret'
          }
        }
      }
    }
  })
  @ApiOkResponse({ description: 'Successfully authentication', type: SuccessLoginDto })
  @ApiForbiddenResponse({ description: 'Invalid credentials' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  async loginAsync(@Req() req): Promise<string> {
    const token = await this.authService.login(req.user);
    this.logger.log(successAuthEvent(req?.user?.email));
    
    return token;
  }

}