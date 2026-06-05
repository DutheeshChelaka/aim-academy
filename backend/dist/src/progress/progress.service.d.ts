import { PrismaService } from '../prisma/prisma.service';
export declare class ProgressService {
    private prisma;
    constructor(prisma: PrismaService);
    getVideoProgress(userId: string, videoId: string): Promise<{
        viewCount: number;
        canWatch: boolean;
        lastViewedAt: Date;
    }>;
    trackVideoView(userId: string, videoId: string, ipAddress?: string, deviceFingerprint?: string): Promise<{
        viewCount: number;
        canWatch: boolean;
        message: string;
    }>;
    canWatchVideo(userId: string, videoId: string): Promise<{
        canWatch: boolean;
        reason: string;
        viewCount?: undefined;
    } | {
        canWatch: boolean;
        viewCount: number;
        reason?: undefined;
    }>;
    getUserProgress(userId: string): Promise<({
        video: {
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
            createdAt: Date;
            title: string;
            description: string | null;
            order: number;
            lessonId: string;
            videoUrl: string;
            duration: number;
        };
    } & {
        id: string;
        ipAddress: string | null;
        userId: string;
        viewCount: number;
        lastViewedAt: Date;
        deviceFingerprint: string | null;
        videoId: string;
    })[]>;
    resetVideoProgress(userId: string, videoId: string): Promise<{
        message: string;
        viewCount?: undefined;
    } | {
        message: string;
        viewCount: number;
    }>;
}
