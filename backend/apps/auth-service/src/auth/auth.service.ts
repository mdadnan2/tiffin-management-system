import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/auth.dto';
import { UserRole } from '@prisma/client';

/**
 * Auth Service - Handles user authentication logic
 * Manages user registration, login, token generation, and validation
 */
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Register a new user
   * - Checks if email already exists
   * - Hashes password with bcrypt
   * - Creates user in database
   * - Returns user object and JWT tokens
   */
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: dto.role || UserRole.USER,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user, ...tokens };
  }

  /**
   * Validate user credentials
   * - Finds user by email
   * - Compares password with bcrypt
   * - Returns user object if valid, null otherwise
   */
  async validateUser(email: string, password: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) return null;

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return null;

      return { id: user.id, email: user.email, name: user.name, role: user.role };
    } catch (error) {
      console.error('validateUser error:', error);
      throw error;
    }
  }

  /**
   * Login user
   * - Generates JWT access and refresh tokens
   * - Returns user object and tokens
   */
  async login(user: any) {
    try {
      const tokens = await this.generateTokens(user.id, user.email, user.role);
      return { user, ...tokens };
    } catch (error) {
      console.error('login error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   * - Validates user exists
   * - Generates new access and refresh tokens
   * - Returns new tokens
   */
  async refreshTokens(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) throw new UnauthorizedException('User not found');

    return this.generateTokens(user.id, user.email, user.role);
  }

  /**
   * Generate JWT access and refresh tokens
   * - Access token: short expiry (15m)
   * - Refresh token: long expiry (7d)
   * - Both signed with HS256 algorithm
   */
  private async generateTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
