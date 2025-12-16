import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealDto, UpdateMealDto } from './dto/meal.dto';
import { BulkMealDto } from './dto/bulk-meal.dto';
import { MealStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Meal Service - Handles meal business logic
 * Manages meal creation, updates, listing, and cancellation
 * Implements auto-pricing from user's PriceSetting
 */
@Injectable()
export class MealService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create or update meal record
   * - Fetches current price from user's PriceSetting
   * - Uses upsert to handle unique constraint (userId, date, mealType)
   * - Sets priceAtTime to lock price at creation
   * - Returns created/updated MealRecord
   */
  async createOrUpdateMeal(userId: string, dto: CreateMealDto) {
    const priceSettings = await this.prisma.priceSetting.findUnique({ where: { userId } });
    const priceAtTime = priceSettings?.[dto.mealType.toLowerCase()] || new Decimal(0);

    const meal = await this.prisma.mealRecord.upsert({
      where: {
        userId_date_mealType: {
          userId,
          date: new Date(dto.date),
          mealType: dto.mealType,
        },
      },
      update: {
        count: dto.count,
        note: dto.note,
        priceAtTime,
        status: MealStatus.ACTIVE,
      },
      create: {
        userId,
        date: new Date(dto.date),
        mealType: dto.mealType,
        count: dto.count,
        note: dto.note,
        priceAtTime,
      },
    });
    return meal;
  }

  /**
   * Create meals for multiple dates
   * - Fetches current price from user's PriceSetting
   * - Creates meals for all specified dates
   * - Returns count and created meals
   */
  async createBulkMeals(userId: string, dto: BulkMealDto) {
    const priceSettings = await this.prisma.priceSetting.findUnique({ where: { userId } });
    const priceAtTime = priceSettings?.[dto.mealType.toLowerCase()] || new Decimal(0);

    const meals = await Promise.all(
      dto.dates.map(date =>
        this.prisma.mealRecord.upsert({
          where: {
            userId_date_mealType: {
              userId,
              date: new Date(date),
              mealType: dto.mealType,
            },
          },
          update: {
            count: dto.count,
            note: dto.note,
            priceAtTime,
            status: MealStatus.ACTIVE,
          },
          create: {
            userId,
            date: new Date(date),
            mealType: dto.mealType,
            count: dto.count,
            note: dto.note,
            priceAtTime,
          },
        })
      )
    );

    return { created: meals.length, meals };
  }

  /**
   * List meals for user
   * - Filters by userId and ACTIVE status
   * - Optional filters: date, mealType, startDate, endDate
   * - Returns meals ordered by date descending
   */
  async listMeals(userId: string, date?: string, mealType?: string, startDate?: string, endDate?: string) {
    const where: any = { userId, status: MealStatus.ACTIVE };
    if (date) where.date = new Date(date);
    if (mealType) where.mealType = mealType;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    return this.prisma.mealRecord.findMany({ where, orderBy: { date: 'desc' } });
  }

  /**
   * Update meal count or note
   * - Validates meal belongs to user
   * - Updates only count and note fields
   * - Returns updated MealRecord
   */
  async updateMeal(userId: string, mealId: string, dto: UpdateMealDto) {
    const meal = await this.prisma.mealRecord.findUnique({ where: { id: mealId } });
    if (!meal || meal.userId !== userId) {
      throw new BadRequestException('Meal not found');
    }

    return this.prisma.mealRecord.update({
      where: { id: mealId },
      data: { count: dto.count, note: dto.note },
    });
  }

  /**
   * Cancel meal (soft delete)
   * - Validates meal belongs to user
   * - Sets status to CANCELLED
   * - Cancelled meals excluded from dashboard totals
   */
  async cancelMeal(userId: string, mealId: string) {
    const meal = await this.prisma.mealRecord.findUnique({ where: { id: mealId } });
    if (!meal || meal.userId !== userId) {
      throw new BadRequestException('Meal not found');
    }

    return this.prisma.mealRecord.update({
      where: { id: mealId },
      data: { status: MealStatus.CANCELLED },
    });
  }
}
