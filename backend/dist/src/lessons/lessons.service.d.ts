import { PrismaService } from '../prisma/prisma.service';
export declare class LessonsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
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
    })[]>;
    findBySubject(subjectId: string): Promise<({
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
    })[]>;
    findByGrade(gradeId: string): Promise<({
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
    })[]>;
    findOne(id: string, userId?: string): Promise<{
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
        videos: {
            id: string;
            createdAt: Date;
            title: string;
            description: string | null;
            order: number;
            lessonId: string;
            videoUrl: string;
            duration: number;
        }[];
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
    }>;
    getVideos(id: string, userId?: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string | null;
        order: number;
        lessonId: string;
        videoUrl: string;
        duration: number;
    }[]>;
    checkUserAccess(lessonId: string, userId: string): Promise<{
        hasAccess: boolean;
        isPublished: boolean;
        enrollment: {
            id: string;
            lessonId: string;
            userId: string;
            expiresAt: Date | null;
            enrolledAt: Date;
            paymentId: string | null;
        } | null;
    }>;
    getUserEnrolledLessons(userId: string): Promise<{
        enrolledAt: Date;
        expiresAt: Date | null;
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
    }[]>;
}
