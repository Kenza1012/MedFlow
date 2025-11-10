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

  // 🔹 Obtenir tous les patients
  @Get('patients')
  async getPatients() {
    return this.userService.getPatients();
  }

  // 🔹 Obtenir tous les médecins
  @Get('medecins')
  async getMedecins() {
    return this.userService.getMedecins();
  }
}
