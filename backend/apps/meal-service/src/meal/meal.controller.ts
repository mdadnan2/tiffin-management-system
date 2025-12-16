import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MealService } from './meal.service';
import { CreateMealDto, UpdateMealDto } from './dto/meal.dto';
import { BulkMealDto } from './dto/bulk-meal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '@app/common';

/**
 * Meal Controller - Handles meal CRUD endpoints
 * Routes: /meals (POST, GET), /meals/:id (PATCH, DELETE)
 * Expects x-user-id header from API Gateway
 */
@Controller('meals')
export class MealController {
  constructor(private mealService: MealService) {}

  /**
   * @route GET /meals/health
   * @desc Health check endpoint
   * @access Public
   * @returns { status: 'ok' }
   */
  @Get('health')
  health() {
    return { status: 'ok' };
  }

  /**
   * @route POST /meals
   * @desc Create or update a meal record for authenticated user
   * @access Private
   * @headers x-user-id: string
   * @body { date: string, mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'CUSTOM', count: number, note?: string }
   * @returns MealRecord with auto-set priceAtTime from user's PriceSetting
   * @sideEffects Upserts meal record, fetches current price from PriceSetting
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  createMeal(@CurrentUser() user: any, @Body() dto: CreateMealDto) {
    return this.mealService.createOrUpdateMeal(user.sub, dto);
  }

  /**
   * @route POST /meals/bulk
   * @desc Create meals for multiple dates at once
   * @access Private
   * @headers x-user-id: string
   * @body { dates: string[], mealType: string, count: number, note?: string }
   * @returns { created: number, meals: MealRecord[] }
   */
  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  createBulkMeals(@CurrentUser() user: any, @Body() dto: BulkMealDto) {
    return this.mealService.createBulkMeals(user.sub, dto);
  }

  /**
   * @route GET /meals
   * @desc List meals for authenticated user with optional filters
   * @access Private
   * @headers x-user-id: string
   * @query date?: string, mealType?: string, startDate?: string, endDate?: string
   * @returns MealRecord[] (only ACTIVE status)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  listMeals(
    @CurrentUser() user: any,
    @Query('date') date?: string,
    @Query('mealType') mealType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.mealService.listMeals(user.sub, date, mealType, startDate, endDate);
  }

  /**
   * @route PATCH /meals/:id
   * @desc Update meal count or note
   * @access Private
   * @headers x-user-id: string
   * @param id: string (meal ID)
   * @body { count?: number, note?: string }
   * @returns Updated MealRecord
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateMeal(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateMealDto) {
    return this.mealService.updateMeal(user.sub, id, dto);
  }

  /**
   * @route DELETE /meals/:id
   * @desc Cancel meal (soft delete - sets status to CANCELLED)
   * @access Private
   * @headers x-user-id: string
   * @param id: string (meal ID)
   * @returns Updated MealRecord with status CANCELLED
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  cancelMeal(@CurrentUser() user: any, @Param('id') id: string) {
    return this.mealService.cancelMeal(user.sub, id);
  }
}
