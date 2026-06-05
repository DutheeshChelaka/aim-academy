import { ProgressService } from './progress.service';
export declare class ProgressController {
    private readonly progressService;
    constructor(progressService: ProgressService);
    getVideoProgress(videoId: string, req: any): Promise<{
        viewCount: number;
        canWatch: boolean;
        lastViewedAt: Date;
    }>;
    trackVideoView(videoId: string, req: any, ipAddress: string, userAgent: string): Promise<{
        viewCount: number;
        canWatch: boolean;
        message: string;
    }>;
    canWatchVideo(videoId: string, req: any): Promise<{
        canWatch: boolean;
        reason: string;
        viewCount?: undefined;
    } | {
        canWatch: boolean;
        viewCount: number;
        reason?: undefined;
    }>;
    getUserProgress(req: any): Promise<({
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
    resetProgress(videoId: string, req: any): Promise<{
        message: string;
        viewCount?: undefined;
    } | {
        message: string;
        viewCount: number;
    }>;
}
