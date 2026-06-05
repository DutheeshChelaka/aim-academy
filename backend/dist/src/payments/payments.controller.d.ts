import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createCheckoutSession(req: any, body: {
        lessonId: string;
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
        session: import("stripe").Stripe.Response<import("stripe").Stripe.Checkout.Session>;
    }>;
    handleWebhook(signature: string, request: any): Promise<{
        received: boolean;
        warning: string;
    } | {
        received: boolean;
        warning?: undefined;
    }>;
    getPayment(id: string): Promise<({
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
    getUserPayments(req: any): Promise<({
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
