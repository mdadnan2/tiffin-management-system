import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PriceService } from './price.service';
import { UpdatePriceDto } from './dto/price.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, Roles, RolesGuard } from '@app/common';

/**
 * Price Controller - Handles meal price settings endpoints
 * Routes: /users/me/price, /admin/users/:userId/price
 * Expects x-user-id and x-user-role headers from API Gateway
 */
@ApiTags('Price Settings')
@Controller()
export class PriceController {
  constructor(private priceService: PriceService) {}

  /**
   * @route GET /users/me/price
   * @desc Get authenticated user's meal price settings
   * @access Private
   * @headers x-user-id: string
   * @returns { userId: string, breakfast: Decimal, lunch: Decimal, dinner: Decimal, custom: Decimal }
   */
  @Get('users/me/price')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my meal prices' })
  @ApiResponse({ status: 200, description: 'Price settings retrieved' })
  @UseGuards(JwtAuthGuard)
  getMyPrice(@CurrentUser() user: any) {
    return this.priceService.getPrice(user.id || user.sub);
  }

  /**
   * @route PATCH /users/me/price
   * @desc Update authenticated user's meal price settings
   * @access Private
   * @headers x-user-id: string
   * @body { breakfast?: number, lunch?: number, dinner?: number, custom?: number }
   * @returns Updated PriceSetting
   */
  @Patch('users/me/price')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my meal prices' })
  @ApiResponse({ status: 200, description: 'Price settings updated' })
  @UseGuards(JwtAuthGuard)
  updateMyPrice(@CurrentUser() user: any, @Body() dto: UpdatePriceDto) {
    return this.priceService.updatePrice(user.id || user.sub, dto);
  }

  /**
   * @route GET /admin/users/:userId/price
   * @desc Get any user's meal price settings (admin only)
   * @access Admin
   * @headers x-user-role: string
   * @param userId: string
   * @returns PriceSetting
   */
  @Get('admin/users/:userId/price')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user meal prices (Admin only)' })
  @ApiResponse({ status: 200, description: 'Price settings retrieved' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getUserPrice(@Param('userId') userId: string) {
    return this.priceService.getPrice(userId);
  }
}
