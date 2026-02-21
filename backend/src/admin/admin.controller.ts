import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { Public } from '../auth/public.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ✅ PUBLIC → création du premier admin
  @Public()
  @Post('create-admin-public')
  async createAdminPublic(
    @Body() body: { name: string; email: string; password: string },
  ) {
    console.log("📥 BODY RECU:", body); // DEBUG IMPORTANT
    return this.adminService.createAdmin(body);
  }

  // ✅ Protégé → création admin depuis un vrai admin
  @Post('create-admin')
  @Roles(Role.ADMIN)
  async createAdmin(
    @Body() body: { name: string; email: string; password: string },
  ) {
    return this.adminService.createAdmin(body);
  }

  // ✅ Créer un médecin
  @Post('create-medecin')
  async createMedecin(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      specialite: string;
    },
  ) {
    return this.adminService.createMedecin(body);
  }

  // ✅ Créer un réceptionniste
  @Post('create-receptionniste')
  async createReceptionniste(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
    },
  ) {
    return this.adminService.createReceptionniste(body);
  }

  @Get('staff')
  async getAllStaff() {
    return this.adminService.getAllStaff();
  }

  @Get('staff/medecins')
  async getMedecins() {
    return this.adminService.getMedecins();
  }

  @Get('staff/receptionnistes')
  async getReceptionnistes() {
    return this.adminService.getReceptionnistes();
  }

  @Post('staff/:id/delete')
  async deleteStaff(@Param('id') id: string) {
    return this.adminService.deleteStaff(Number(id));
  }

  @Get('dashboard')
  async getDashboardStats(@Query('period') period?: 'day' | 'week' | 'month' | 'year') {
    return this.adminService.getDashboardStats(period || 'month');
  }

  @Put('update-service')
  async updateService(
    @Body()
    body: {
      serviceName: string;
      price: number;
      description?: string;
    },
  ) {
    return this.adminService.updateService(body);
  }

  @Get('patients')
  async getAllPatients() {
    return this.adminService.getAllPatients();
  }

  @Get('stats/revenue')
  async getRevenueStats(@Query('year') year?: string) {
    return this.adminService.getRevenueStats(year ? Number(year) : undefined);
  }


}
