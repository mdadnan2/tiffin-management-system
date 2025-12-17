import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { MonthlyDashboardDto, WeeklyDashboardDto } from './dto/dashboard.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '@app/common';

/**
 * Dashboard Controller - Handles user dashboard endpoints
 * Routes: /dashboard
 * Expects x-user-id header from API Gateway
 */
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
  @UseGuards(JwtAuthGuard)
  getDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getUserDashboard(user.sub);
  }

  /**
   * @route GET /dashboard/health
   * @desc Health check endpoint
   * @access Public
   * @returns { status: 'ok' }
   */
  @Get('health')
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
  @UseGuards(JwtAuthGuard)
  getMonthlyDashboard(@CurrentUser() user: any, @Query() query: MonthlyDashboardDto) {
    return this.dashboardService.getMonthlyDashboard(user.sub, query);
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
  @UseGuards(JwtAuthGuard)
  getWeeklyDashboard(@CurrentUser() user: any, @Query() query: WeeklyDashboardDto) {
    return this.dashboardService.getWeeklyDashboard(user.sub, query);
  }
}
