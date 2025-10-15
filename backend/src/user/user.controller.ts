import { Controller, Post, Body, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() body) {
    return this.userService.register(body);
  }

  @Get()
  async getAll() {
    return this.userService.getAll();
  }
}
