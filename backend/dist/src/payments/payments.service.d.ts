import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
export declare class PaymentsService {
    private prisma;
    private configService;
    private stripe;
    constructor(prisma: PrismaService, configService: ConfigService);
    createCheckoutSession(data: {
        userId: string;
        lessonId: string;
        userEmail: string;
        userName: string;
    }): Promise<{
        sessionId: string;
        sessionUrl: string | null;
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            amount: number;
            currency: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            paymentMethod: string | null;
            transactionId: string | null;
            paymentGateway: string;
        };
        lesson: {
            subject: {
                grade: {
                    number: number;
                    id: string;
                    name: string;
                    createdAt: Date;
                };
            } & {
                id: string;
                name: string;
                createdAt: Date;
                gradeId: string;
                thumbnailUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            thumbnailUrl: string | null;
            title: string;
            description: string | null;
            subjectId: string;
            price: number;
            order: number;
            isPublished: boolean;
        };
    }>;
    verifyPayment(sessionId: string): Promise<{
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            amount: number;
            currency: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            paymentMethod: string | null;
            transactionId: string | null;
            paymentGateway: string;
        };
        enrollment: {
            lesson: {
                subject: {
                    grade: {
                        number: number;
                        id: string;
                        name: string;
                        createdAt: Date;
                    };
                } & {
                    id: string;
                    name: string;
                    createdAt: Date;
                    gradeId: string;
                    thumbnailUrl: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                thumbnailUrl: string | null;
                title: string;
                description: string | null;
                subjectId: string;
                price: number;
                order: number;
                isPublished: boolean;
            };
        } & {
            id: string;
            lessonId: string;
            userId: string;
            expiresAt: Date | null;
            enrolledAt: Date;
            paymentId: string | null;
        };
        session: Stripe.Response<Stripe.Checkout.Session>;
    }>;
    handleWebhook(signature: string, body: Buffer): Promise<{
        received: boolean;
        warning: string;
    } | {
        received: boolean;
        warning?: undefined;
    }>;
    private handleCheckoutComplete;
    private handlePaymentFailed;
    getPayment(paymentId: string): Promise<({
        enrollments: ({
            lesson: {
                subject: {
                    grade: {
                        number: number;
                        id: string;
                        name: string;
                        createdAt: Date;
                    };
                } & {
                    id: string;
                    name: string;
                    createdAt: Date;
                    gradeId: string;
                    thumbnailUrl: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                thumbnailUrl: string | null;
                title: string;
                description: string | null;
                subjectId: string;
                price: number;
                order: number;
                isPublished: boolean;
            };
        } & {
            id: string;
            lessonId: string;
            userId: string;
            expiresAt: Date | null;
            enrolledAt: Date;
            paymentId: string | null;
        })[];
        user: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: number;
        currency: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        paymentMethod: string | null;
        transactionId: string | null;
        paymentGateway: string;
    }) | null>;
    getUserPayments(userId: string): Promise<({
        enrollments: ({
            lesson: {
                subject: {
                    grade: {
                        number: number;
                        id: string;
                        name: string;
                        createdAt: Date;
                    };
                } & {
                    id: string;
                    name: string;
                    createdAt: Date;
                    gradeId: string;
                    thumbnailUrl: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                thumbnailUrl: string | null;
                title: string;
                description: string | null;
                subjectId: string;
                price: number;
                order: number;
                isPublished: boolean;
            };
        } & {
            id: string;
            lessonId: string;
            userId: string;
            expiresAt: Date | null;
            enrolledAt: Date;
            paymentId: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: number;
        currency: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        paymentMethod: string | null;
        transactionId: string | null;
        paymentGateway: string;
    })[]>;
}
