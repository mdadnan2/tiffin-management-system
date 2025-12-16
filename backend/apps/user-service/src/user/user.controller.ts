import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, Roles, RolesGuard } from '@app/common';

@Controller('users')
export class UserController {
  
  constructor(private userService: UserService) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return this.userService.getProfile(user.sub);
  }


  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.userService.updateProfile(user.sub, dto);
  }


  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  listUsers() {
    return this.userService.listUsers();
  } 
}
