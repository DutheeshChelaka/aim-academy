import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    
this.stripe = new Stripe(stripeSecretKey);

  }

  // Create checkout session
  async createCheckoutSession(data: {
    userId: string;
    lessonId: string;
    userEmail: string;
    userName: string;
  }) {
    const { userId, lessonId, userEmail, userName } = data;

    // Get lesson details
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        subject: {
          include: {
            grade: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Check if already enrolled
    const existing = await this.prisma.enrollment.findFirst({
      where: { userId, lessonId },
    });

    if (existing) {
      throw new BadRequestException('Already enrolled in this lesson');
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount: lesson.price,
        currency: 'LKR',
        status: 'PENDING',
        paymentGateway: 'Stripe',
      },
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    // Create Stripe checkout session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'lkr',
            product_data: {
              name: lesson.title,
              description: `${lesson.subject.grade.name} - ${lesson.subject.name}`,
              images: lesson.thumbnailUrl ? [lesson.thumbnailUrl] : [],
            },
            unit_amount: Math.round(lesson.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment/cancel`,
      customer_email: userEmail,
      metadata: {
        paymentId: payment.id,
        userId: userId,
        lessonId: lessonId,
        userName: userName,
      },
    });

    // Update payment with Stripe session ID
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: session.id,
      },
    });

    return {
      sessionId: session.id,
      sessionUrl: session.url,
      payment,
      lesson,
    };
  }

  // Verify payment and create enrollment
  async verifyPayment(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      throw new BadRequestException('Payment not completed');
    }

    // Type-safe metadata extraction
    const metadata = session.metadata || {};
    const paymentId = metadata.paymentId;
    const userId = metadata.userId;
    const lessonId = metadata.lessonId;

    if (!paymentId || !userId || !lessonId) {
      throw new BadRequestException('Invalid session metadata');
    }

    // Update payment status
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        paymentMethod: 'card',
        updatedAt: new Date(),
      },
    });

    // Create enrollment
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId,
        lessonId,
        paymentId,
        enrolledAt: new Date(),
      },
      include: {
        lesson: {
          include: {
            subject: {
              include: {
                grade: true,
              },
            },
          },
        },
      },
    });

    return {
      payment,
      enrollment,
      session,
    };
  }

  // Handle Stripe webhook
  async handleWebhook(signature: string, body: Buffer) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not configured, skipping webhook verification');
      return { received: true, warning: 'Webhook secret not configured' };
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutComplete(session);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailed(failedPayment);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const metadata = session.metadata || {};
    const paymentId = metadata.paymentId;
    const userId = metadata.userId;
    const lessonId = metadata.lessonId;

    if (!paymentId || !userId || !lessonId) {
      console.error('Invalid metadata in checkout session');
      return;
    }

    // Update payment
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        paymentMethod: 'card',
        updatedAt: new Date(),
      },
    });

    // Create enrollment if not exists
    const existing = await this.prisma.enrollment.findFirst({
      where: { userId, lessonId },
    });

    if (!existing) {
      await this.prisma.enrollment.create({
        data: {
          userId,
          lessonId,
          paymentId,
          enrolledAt: new Date(),
        },
      });
    }

    console.log('Enrollment created for payment:', paymentId);
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    // Find payment by transaction ID
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: paymentIntent.id },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
    }
  }

  // Get payment by ID
  async getPayment(paymentId: string) {
    return this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        enrollments: {
          include: {
            lesson: {
              include: {
                subject: {
                  include: {
                    grade: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  // Get user payment history
  async getUserPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: {
        enrollments: {
          include: {
            lesson: {
              include: {
                subject: {
                  include: {
                    grade: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}