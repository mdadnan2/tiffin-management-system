import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MealStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Admin Service - Handles admin monitoring and analytics
 * Provides user statistics and summaries for admin dashboard
 */
@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all users with meal statistics
   * - Fetches all users from database
   * - For each user, calculates meal count and total amount
   * - Returns users with aggregated stats
   */
  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const meals = await this.prisma.mealRecord.findMany({
          where: { userId: user.id, status: MealStatus.ACTIVE },
        });

        const mealCount = meals.reduce((sum, meal) => sum + meal.count, 0);
        const totalAmount = meals.reduce((sum, meal) => {
          return sum.add(new Decimal(meal.priceAtTime).mul(meal.count));
        }, new Decimal(0));

        return {
          ...user,
          mealCount,
          totalAmount: totalAmount.toNumber(),
        };
      })
    );

    return usersWithStats;
  }

  /**
   * Get detailed summary for specific user
   * - Fetches user details
   * - Calculates total meals, breakdown by type, and total amount
   * - Returns comprehensive user summary
   */
  async getUserSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    const meals = await this.prisma.mealRecord.findMany({
      where: { userId, status: MealStatus.ACTIVE },
    });

    const totalMeals = meals.reduce((sum, meal) => sum + meal.count, 0);
    const byType = meals.reduce((acc, meal) => {
      acc[meal.mealType] = (acc[meal.mealType] || 0) + meal.count;
      return acc;
    }, {});

    const totalAmount = meals.reduce((sum, meal) => {
      return sum.add(new Decimal(meal.priceAtTime).mul(meal.count));
    }, new Decimal(0));

    return {
      user,
      totalMeals,
      byType,
      totalAmount: totalAmount.toNumber(),
    };
  }
}
