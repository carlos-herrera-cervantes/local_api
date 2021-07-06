import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import users from '../scripts/users.json';

@Injectable()
export class LoaderUsers implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(LoaderUsers.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      if (this.configService.get<string>('NODE_ENV') !== 'test') {
        const totalUsers = await this.usersService.countDocsAsync();
  
        return totalUsers > 0 ? this.logger.log({
          datetime: new Date(),
          appId: '',
          event: 'seed_users_success',
          level: 'INFO',
          description: 'The basic users to login have already been created'
        }) : (
          await this.usersService.createManyAsync(users as CreateUserDto[]),
          this.logger.log({
            datetime: new Date(),
            appId: '',
            event: 'seed_users_success',
            level: 'INFO',
            description: 'The basic users to login have been created successfully'
          })
        );
      }
    }
    catch (err) {
      this.logger.error({
        datetime: new Date(),
        appId: '',
        event: 'seed_users_fail',
        level: 'ERROR',
        description: 'Something went wrong trying to create the basic users: ' + err?.message
      });

      return;
    }
  }

}