import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { MonthlyDashboardDto, WeeklyDashboardDto } from './dto/dashboard.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '@app/common';

/**
 * Dashboard Controller - Handles user dashboard endpoints
 * Routes: /dashboard
 * Expects x-user-id header from API Gateway
 */
@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  /**
   * @route GET /dashboard
   * @desc Get user dashboard with meal totals and breakdown
   * @access Private
   * @headers x-user-id: string
   * @returns { totalMeals: number, byType: object, totalAmount: number }
   * @calculation totalAmount = SUM(count × priceAtTime) for ACTIVE meals only
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard retrieved successfully' })
  @UseGuards(JwtAuthGuard)
  getDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getUserDashboard(user.id || user.sub);
  }

  /**
   * @route GET /dashboard/health
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

  /**
   * @route GET /dashboard/monthly
   * @desc Get monthly dashboard with week breakdown
   * @access Private
   * @headers x-user-id: string
   * @query month?: string (YYYY-MM format)
   * @returns Monthly stats with week-by-week breakdown
   */
  @Get('monthly')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get monthly dashboard' })
  @ApiResponse({ status: 200, description: 'Monthly dashboard retrieved' })
  @UseGuards(JwtAuthGuard)
  getMonthlyDashboard(@CurrentUser() user: any, @Query() query: MonthlyDashboardDto) {
    return this.dashboardService.getMonthlyDashboard(user.id || user.sub, query);
  }

  /**
   * @route GET /dashboard/weekly
   * @desc Get weekly dashboard with day breakdown
   * @access Private
   * @headers x-user-id: string
   * @query week?: string (YYYY-Www format)
   * @returns Weekly stats with day-by-day breakdown
   */
  @Get('weekly')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get weekly dashboard' })
  @ApiResponse({ status: 200, description: 'Weekly dashboard retrieved' })
  @UseGuards(JwtAuthGuard)
  getWeeklyDashboard(@CurrentUser() user: any, @Query() query: WeeklyDashboardDto) {
    return this.dashboardService.getWeeklyDashboard(user.id || user.sub, query);
  }
}
