import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MealService } from './meal.service';
import { CreateMealDto, UpdateMealDto } from './dto/meal.dto';
import { BulkMealDto } from './dto/bulk-meal.dto';
import { BulkUpdateDto, BulkDeleteDto } from './dto/bulk-operations.dto';
import { CalendarQueryDto } from './dto/calendar.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '@app/common';

/**
 * Meal Controller - Handles meal CRUD endpoints
 * Routes: /meals (POST, GET), /meals/:id (PATCH, DELETE)
 * Expects x-user-id header from API Gateway
 */
@ApiTags('Meals')
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
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update meal' })
  @ApiResponse({ status: 201, description: 'Meal created/updated successfully' })
  @UseGuards(JwtAuthGuard)
  createMeal(@CurrentUser() user: any, @Body() dto: CreateMealDto) {
    return this.mealService.createOrUpdateMeal(user.id || user.sub, dto);
  }

  /**
   * @route POST /meals/bulk
   * @desc Create meals for multiple dates at once with optional day filters
   * @access Private
   * @headers x-user-id: string
   * @body Option 1: { dates: string[], mealType: string, count: number, note?: string }
   * @body Option 2: { startDate: string, endDate: string, mealType: string, count: number, note?: string }
   * @body Option 3: { startDate: string, endDate: string, skipWeekends: true, mealType: string, count: number }
   * @body Option 4: { startDate: string, endDate: string, daysOfWeek: [1,2,3,4,5], mealType: string, count: number }
   * @returns { created: number, meals: MealRecord[] }
   */
  @Post('bulk')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create bulk meals' })
  @ApiResponse({ status: 201, description: 'Bulk meals created successfully' })
  @UseGuards(JwtAuthGuard)
  createBulkMeals(@CurrentUser() user: any, @Body() dto: BulkMealDto) {
    return this.mealService.createBulkMeals(user.id || user.sub, dto);
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List meals' })
  @ApiResponse({ status: 200, description: 'Meals retrieved successfully' })
  @UseGuards(JwtAuthGuard)
  listMeals(
    @CurrentUser() user: any,
    @Query('date') date?: string,
    @Query('mealType') mealType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.mealService.listMeals(user.id || user.sub, date, mealType, startDate, endDate);
  }

  /**
   * @route GET /meals/calendar
   * @desc Get meals grouped by date in calendar format
   * @access Private
   * @headers x-user-id: string
   * @query month?: string (YYYY-MM format), week?: string (YYYY-Www format)
   * @returns { "YYYY-MM-DD": MealRecord[] }
   */
  @Get('calendar')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get calendar view' })
  @ApiResponse({ status: 200, description: 'Calendar retrieved successfully' })
  @UseGuards(JwtAuthGuard)
  getCalendar(@CurrentUser() user: any, @Query() query: CalendarQueryDto) {
    return this.mealService.getCalendar(user.id || user.sub, query);
  }

  /**
   * @route PATCH /meals/bulk
   * @desc Update multiple meals in date range
   * @access Private
   * @headers x-user-id: string
   * @body { startDate: string, endDate: string, mealType?: string, count?: number, note?: string }
   * @returns { updated: number }
   */
  @Patch('bulk')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update meals' })
  @ApiResponse({ status: 200, description: 'Meals updated successfully' })
  @UseGuards(JwtAuthGuard)
  bulkUpdateMeals(@CurrentUser() user: any, @Body() dto: BulkUpdateDto) {
    console.log('🎯 Bulk Update Request Received');
    console.log('User:', user);
    console.log('DTO:', dto);
    return this.mealService.bulkUpdateMeals(user.id || user.sub, dto);
  }

  /**
   * @route DELETE /meals/bulk
   * @desc Cancel multiple meals in date range
   * @access Private
   * @headers x-user-id: string
   * @body { startDate: string, endDate: string, mealType?: string }
   * @returns { cancelled: number }
   */
  @Delete('bulk')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk cancel meals' })
  @ApiResponse({ status: 200, description: 'Meals cancelled successfully' })
  @UseGuards(JwtAuthGuard)
  bulkCancelMeals(@CurrentUser() user: any, @Body() dto: BulkDeleteDto) {
    return this.mealService.bulkCancelMeals(user.id || user.sub, dto);
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update meal' })
  @ApiResponse({ status: 200, description: 'Meal updated successfully' })
  @UseGuards(JwtAuthGuard)
  updateMeal(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateMealDto) {
    return this.mealService.updateMeal(user.id || user.sub, id, dto);
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel meal' })
  @ApiResponse({ status: 200, description: 'Meal cancelled successfully' })
  @UseGuards(JwtAuthGuard)
  cancelMeal(@CurrentUser() user: any, @Param('id') id: string) {
    return this.mealService.cancelMeal(user.id || user.sub, id);
  }
}
