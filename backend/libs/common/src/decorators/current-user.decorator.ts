import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract user from request object.
 * Used in controllers to get authenticated user info.
 * Works with both JWT strategy (monolith) and header-based auth (microservices).
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // In microservices, user comes from headers injected by gateway
    if (request.headers['x-user-id']) {
      return {
        id: parseInt(request.headers['x-user-id']),
        role: request.headers['x-user-role'],
      };
    }
    // In monolith, user comes from JWT strategy
    return request.user;
  },
);
