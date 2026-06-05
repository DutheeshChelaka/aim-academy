import { PrismaService } from '../prisma/prisma.service';
export declare class EnrollmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, lessonId: string, paymentId?: string): Promise<{
        message: string;
        enrollment: {
            id: string;
            lessonId: string;
            userId: string;
            expiresAt: Date | null;
            enrolledAt: Date;
            paymentId: string | null;
        };
    }>;
    findUserEnrollments(userId: string): Promise<({
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
            _count: {
                videos: number;
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
        } | null;
    } & {
        id: string;
        lessonId: string;
        userId: string;
        expiresAt: Date | null;
        enrolledAt: Date;
        paymentId: string | null;
    })[]>;
    checkEnrollment(lessonId: string, userId: string): Promise<{
        isEnrolled: boolean;
        enrollmentId: string | null;
        enrolledAt: Date | null;
    }>;
    findAll(): Promise<({
        user: {
            id: string;
            phoneNumber: string | null;
            name: string;
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
        } | null;
    } & {
        id: string;
        lessonId: string;
        userId: string;
        expiresAt: Date | null;
        enrolledAt: Date;
        paymentId: string | null;
    })[]>;
}
