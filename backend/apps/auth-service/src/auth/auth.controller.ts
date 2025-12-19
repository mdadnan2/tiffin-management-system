import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';

/**
 * Auth Controller - Handles authentication endpoints
 * Routes: /auth/register, /auth/login, /auth/refresh, /auth/me
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * @route POST /auth/register
   * @desc Register a new user with email, password, name, and optional role
   * @access Public
   * @body { email: string, password: string, name: string, role?: 'USER' | 'ADMIN' }
   * @returns { user: User, accessToken: string, refreshToken: string }
   */
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * @route POST /auth/login
   * @desc Login user with email and password, returns JWT tokens
   * @access Public
   * @body { email: string, password: string }
   * @returns { user: User, accessToken: string, refreshToken: string }
   */
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @UseGuards(AuthGuard('local'))
  async login(@Body() dto: LoginDto, @Request() req) {
    try {
      return await this.authService.login(req.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * @route POST /auth/refresh
   * @desc Refresh access token using valid refresh token
   * @access Public (requires valid refresh token)
   * @body { refreshToken: string }
   * @returns { accessToken: string, refreshToken: string }
   */
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  /**
   * @route GET /auth/me
   * @desc Get current authenticated user info
   * @access Private (requires valid JWT)
   * @returns { id: string, email: string, name: string, role: string }
   */
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'User info retrieved' })
  @UseGuards(AuthGuard('jwt'))
  getMe(@Request() req) {
    const user = req.user;
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  /**
   * @route GET /auth/health
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
}
