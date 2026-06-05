"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const stripe_1 = __importDefault(require("stripe"));
const config_1 = require("@nestjs/config");
let PaymentsService = class PaymentsService {
    prisma;
    configService;
    stripe;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');
        if (!stripeSecretKey) {
            throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
        }
        this.stripe = new stripe_1.default(stripeSecretKey);
    }
    async createCheckoutSession(data) {
        const { userId, lessonId, userEmail, userName } = data;
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
            throw new common_1.NotFoundException('Lesson not found');
        }
        const existing = await this.prisma.enrollment.findFirst({
            where: { userId, lessonId },
        });
        if (existing) {
            throw new common_1.BadRequestException('Already enrolled in this lesson');
        }
        const payment = await this.prisma.payment.create({
            data: {
                userId,
                amount: lesson.price,
                currency: 'LKR',
                status: 'PENDING',
                paymentGateway: 'Stripe',
            },
        });
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3001';
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
                        unit_amount: Math.round(lesson.price * 100),
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
    async verifyPayment(sessionId) {
        const session = await this.stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== 'paid') {
            throw new common_1.BadRequestException('Payment not completed');
        }
        const metadata = session.metadata || {};
        const paymentId = metadata.paymentId;
        const userId = metadata.userId;
        const lessonId = metadata.lessonId;
        if (!paymentId || !userId || !lessonId) {
            throw new common_1.BadRequestException('Invalid session metadata');
        }
        const payment = await this.prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'COMPLETED',
                paymentMethod: 'card',
                updatedAt: new Date(),
            },
        });
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
    async handleWebhook(signature, body) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            console.warn('STRIPE_WEBHOOK_SECRET not configured, skipping webhook verification');
            return { received: true, warning: 'Webhook secret not configured' };
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
        }
        catch (err) {
            throw new common_1.BadRequestException(`Webhook Error: ${err.message}`);
        }
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                await this.handleCheckoutComplete(session);
                break;
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('PaymentIntent succeeded:', paymentIntent.id);
                break;
            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                await this.handlePaymentFailed(failedPayment);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        return { received: true };
    }
    async handleCheckoutComplete(session) {
        const metadata = session.metadata || {};
        const paymentId = metadata.paymentId;
        const userId = metadata.userId;
        const lessonId = metadata.lessonId;
        if (!paymentId || !userId || !lessonId) {
            console.error('Invalid metadata in checkout session');
            return;
        }
        await this.prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'COMPLETED',
                paymentMethod: 'card',
                updatedAt: new Date(),
            },
        });
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
    async handlePaymentFailed(paymentIntent) {
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
    async getPayment(paymentId) {
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
    async getUserPayments(userId) {
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map