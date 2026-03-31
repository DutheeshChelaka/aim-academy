import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  /**
   * ✅ This guard allows requests to pass even if JWT is missing or invalid
   * If JWT is valid, it attaches user to req.user
   * If JWT is missing/invalid, req.user will be undefined
   */
  handleRequest(err: any, user: any) {
    // Don't throw error if user is not authenticated
    // Just return user (will be undefined if not authenticated)
    return user;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Try to activate the guard (validate JWT)
      await super.canActivate(context);
    } catch (err) {
      // If JWT validation fails, don't throw error - just continue
      // This allows unauthenticated requests to proceed
    }
    
    // Always return true to allow the request to proceed
    return true;
  }
}