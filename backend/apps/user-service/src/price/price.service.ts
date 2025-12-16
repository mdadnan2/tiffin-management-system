import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePriceDto } from './dto/price.dto';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Price Service - Handles meal price settings business logic
 * Manages price retrieval and updates per user
 */
@Injectable()
export class PriceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user's price settings
   * - Creates default price settings if not exists
   * - Returns PriceSetting with all meal type prices
   */
  async getPrice(userId: string) {
    let price = await this.prisma.priceSetting.findUnique({ where: { userId } });
    
    if (!price) {
      price = await this.prisma.priceSetting.create({
        data: { userId },
      });
    }
    
    return price;
  }

  /**
   * Update user's price settings
   * - Converts numbers to Decimal for precision
   * - Uses upsert to create or update
   * - Returns updated PriceSetting
   */
  async updatePrice(userId: string, dto: UpdatePriceDto) {
    const data: any = {};
    if (dto.breakfast !== undefined) data.breakfast = new Decimal(dto.breakfast);
    if (dto.lunch !== undefined) data.lunch = new Decimal(dto.lunch);
    if (dto.dinner !== undefined) data.dinner = new Decimal(dto.dinner);
    if (dto.custom !== undefined) data.custom = new Decimal(dto.custom);

    return this.prisma.priceSetting.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }
}
