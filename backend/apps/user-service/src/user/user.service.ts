import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/user.dto';

/**
 * User Service - Handles user profile business logic
 * Manages user profile retrieval, updates, and listing
 */
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user profile by ID
   * - Returns user details excluding password
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, mobile: true, role: true, createdAt: true },
    });
    if (!user) throw new NotFoundException(`User with ID '${userId}' not found`);
    return user;
  }

  /**
   * Update user profile
   * - Currently supports updating name only
   * - Returns updated user object
   */
  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID '${userId}' not found`);
    
    return this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name, mobile: dto.mobile },
      select: { id: true, email: true, name: true, mobile: true, role: true },
    });
  }

  /**
   * List all users (admin only)
   * - Returns all users with basic info
   */
  async listUsers() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, mobile: true, role: true, createdAt: true },
    });
  }
}
