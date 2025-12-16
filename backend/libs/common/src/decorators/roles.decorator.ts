import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to specify required roles for a route.
 * Usage: @Roles('ADMIN')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
