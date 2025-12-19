import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '@app/common';

/**
 * Admin Controller - Handles admin monitoring endpoints
 * Routes: /admin/users, /admin/users/:id/summary
 * Expects x-user-role header from API Gateway
 * All routes require ADMIN role
 */
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  /**
   * @route GET /admin/users
   * @desc Get all users with meal statistics
   * @access Admin only
   * @headers x-user-role: string
   * @returns User[] with mealCount and totalAmount
   */
  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  /**
   * @route GET /admin/users/:id/summary
   * @desc Get detailed summary for specific user
   * @access Admin only
   * @headers x-user-role: string
   * @param id: string (user ID)
   * @returns { user: User, totalMeals: number, byType: object, totalAmount: number }
   */
  @Get('users/:id/summary')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user summary (Admin only)' })
  @ApiResponse({ status: 200, description: 'User summary retrieved' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getUserSummary(@Param('id') id: string) {
    return this.adminService.getUserSummary(id);
  }

  /**
   * @route GET /admin/health
   * @desc Health check endpoint
   * @access Public
   * @returns { status: 'ok' }
   */
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() {
    return { status: 'ok' };
  }
}
