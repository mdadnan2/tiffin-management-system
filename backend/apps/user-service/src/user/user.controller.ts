import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, Roles, RolesGuard } from '@app/common';

@ApiTags('Users')
@Controller('users')
export class UserController {
  
  constructor(private userService: UserService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() {
    return { status: 'ok' };
  }
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return this.userService.getProfile(user.id || user.sub);
  }


  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.userService.updateProfile(user.id || user.sub, dto);
  }


  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users list retrieved' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  listUsers() {
    return this.userService.listUsers();
  } 
}
