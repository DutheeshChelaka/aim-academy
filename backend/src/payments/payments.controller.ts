import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Create checkout session
  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(
    @Request() req: any,
    @Body() body: { lessonId: string },
  ) {
    if (!body.lessonId) {
      throw new BadRequestException('lessonId is required');
    }

    // ✅ FIX: Extract userId correctly from JWT payload
    const userId = req.user.userId || req.user.sub || req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.name;

    console.log('🔍 User from JWT:', {
      userId,
      userEmail,
      userName,
      fullUser: req.user,
    });

    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    return this.paymentsService.createCheckoutSession({
      userId,
      lessonId: body.lessonId,
      userEmail,
      userName,
    });
  }

  // Verify payment after redirect from Stripe
  @Get('verify')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(@Query('session_id') sessionId: string) {
    if (!sessionId) {
      throw new BadRequestException('session_id is required');
    }

    return this.paymentsService.verifyPayment(sessionId);
  }

  // Stripe webhook endpoint (no auth guard - Stripe calls this)
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: any,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    if (!request.rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    return this.paymentsService.handleWebhook(signature, request.rawBody);
  }

  // Get payment details
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPayment(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Payment ID is required');
    }

    return this.paymentsService.getPayment(id);
  }

  // Get user payment history
  @Get('user/history')
  @UseGuards(JwtAuthGuard)
  async getUserPayments(@Request() req: any) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    return this.paymentsService.getUserPayments(userId);
  }
}