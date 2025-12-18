import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MonthlyDashboardDto, WeeklyDashboardDto } from './dto/dashboard.dto';
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
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const meals = await this.prisma.mealRecord.findMany({
      where: { 
        userId, 
        status: MealStatus.ACTIVE,
        date: { lte: today }
      },
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

  /**
   * Get monthly dashboard with week-by-week breakdown
   */
  async getMonthlyDashboard(userId: string, dto: MonthlyDashboardDto) {
    let year: number, month: number;

    if (dto.month) {
      [year, month] = dto.month.split('-').map(Number);
    } else {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth() + 1;
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const finalEndDate = endDate > today ? today : endDate;

    const meals = await this.prisma.mealRecord.findMany({
      where: {
        userId,
        status: MealStatus.ACTIVE,
        date: { gte: startDate, lte: finalEndDate },
      },
      orderBy: { date: 'asc' },
    });

    const totalMeals = meals.reduce((sum, meal) => sum + meal.count, 0);
    const byType = meals.reduce((acc, meal) => {
      acc[meal.mealType] = (acc[meal.mealType] || 0) + meal.count;
      return acc;
    }, {});

    const totalAmount = meals.reduce((sum, meal) => {
      return sum.add(new Decimal(meal.priceAtTime).mul(meal.count));
    }, new Decimal(0));

    const amountByType = meals.reduce((acc, meal) => {
      const amount = new Decimal(meal.priceAtTime).mul(meal.count).toNumber();
      acc[meal.mealType] = (acc[meal.mealType] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);

    // Count unique days with meals
    const uniqueDays = new Set(meals.map(meal => meal.date.toISOString().split('T')[0])).size;

    // Group by week
    const byWeek = meals.reduce((acc, meal) => {
      const date = new Date(meal.date);
      const weekNum = Math.ceil(date.getDate() / 7);
      if (!acc[weekNum]) acc[weekNum] = { meals: 0, amount: 0 };
      acc[weekNum].meals += meal.count;
      acc[weekNum].amount += new Decimal(meal.priceAtTime).mul(meal.count).toNumber();
      return acc;
    }, {} as Record<number, { meals: number; amount: number }>);

    return {
      month: `${year}-${String(month).padStart(2, '0')}`,
      totalMeals,
      byType,
      totalAmount: totalAmount.toNumber(),
      amountByType,
      daysWithMeals: uniqueDays,
      byWeek,
    };
  }

  /**
   * Get weekly dashboard
   */
  async getWeeklyDashboard(userId: string, dto: WeeklyDashboardDto) {
    let year: number, week: number;

    if (dto.week) {
      [year, week] = dto.week.split('-W').map(Number);
    } else {
      const now = new Date();
      year = now.getFullYear();
      const firstDayOfYear = new Date(year, 0, 1);
      const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
      week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (week - 1) * 7;
    const startDate = new Date(firstDayOfYear.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const finalEndDate = endDate > today ? today : endDate;

    const meals = await this.prisma.mealRecord.findMany({
      where: {
        userId,
        status: MealStatus.ACTIVE,
        date: { gte: startDate, lte: finalEndDate },
      },
      orderBy: { date: 'asc' },
    });

    const totalMeals = meals.reduce((sum, meal) => sum + meal.count, 0);
    const byType = meals.reduce((acc, meal) => {
      acc[meal.mealType] = (acc[meal.mealType] || 0) + meal.count;
      return acc;
    }, {});

    const totalAmount = meals.reduce((sum, meal) => {
      return sum.add(new Decimal(meal.priceAtTime).mul(meal.count));
    }, new Decimal(0));

    // Group by day
    const byDay = meals.reduce((acc, meal) => {
      const dateKey = meal.date.toISOString().split('T')[0];
      if (!acc[dateKey]) acc[dateKey] = { meals: 0, amount: 0 };
      acc[dateKey].meals += meal.count;
      acc[dateKey].amount += new Decimal(meal.priceAtTime).mul(meal.count).toNumber();
      return acc;
    }, {} as Record<string, { meals: number; amount: number }>);

    return {
      week: `${year}-W${String(week).padStart(2, '0')}`,
      totalMeals,
      byType,
      totalAmount: totalAmount.toNumber(),
      byDay,
    };
  }
}
