import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
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
}
