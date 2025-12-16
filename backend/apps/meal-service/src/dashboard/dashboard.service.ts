import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MealStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Dashboard Service - Handles user dashboard analytics
 * Calculates meal totals and amounts for user
 */
@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user dashboard with totals
   * - Fetches all ACTIVE meals for user
   * - Calculates total meal count
   * - Breaks down meals by type (BREAKFAST, LUNCH, DINNER, CUSTOM)
   * - Calculates total amount: SUM(count × priceAtTime)
   * - Returns dashboard object with all metrics
   */
  async getUserDashboard(userId: string) {
    const meals = await this.prisma.mealRecord.findMany({
      where: { userId, status: MealStatus.ACTIVE },
      orderBy: { date: 'asc' },
    });

    const totalMeals = meals.reduce((sum, meal) => sum + meal.count, 0);
    const byType = meals.reduce((acc, meal) => {
      acc[meal.mealType] = (acc[meal.mealType] || 0) + meal.count;
      return acc;
    }, {});

    const totalAmount = meals.reduce((sum, meal) => {
      const price = new Decimal(meal.priceAtTime);
      const count = new Decimal(meal.count);
      return sum.add(price.mul(count));
    }, new Decimal(0));

    // Calculate amount by type for pie chart
    const amountByType = meals.reduce((acc, meal) => {
      const amount = new Decimal(meal.priceAtTime).mul(meal.count).toNumber();
      acc[meal.mealType] = (acc[meal.mealType] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMeals,
      byType,
      totalAmount: totalAmount.toNumber(),
      amountByType,
    };
  }
}
