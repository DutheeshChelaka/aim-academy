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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProgressService = class ProgressService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getVideoProgress(userId, videoId) {
        const video = await this.prisma.video.findUnique({
            where: { id: videoId },
            include: { lesson: true },
        });
        if (!video) {
            throw new common_1.ForbiddenException('Video not found');
        }
        const enrollment = await this.prisma.enrollment.findFirst({
            where: {
                userId,
                lessonId: video.lessonId,
            },
        });
        if (!enrollment) {
            throw new common_1.ForbiddenException('Not enrolled in this lesson');
        }
        let progress = await this.prisma.progress.findUnique({
            where: {
                userId_videoId: {
                    userId,
                    videoId,
                },
            },
        });
        if (!progress) {
            progress = await this.prisma.progress.create({
                data: {
                    userId,
                    videoId,
                    viewCount: 0,
                    lastViewedAt: new Date(),
                },
            });
        }
        return {
            viewCount: progress.viewCount,
            canWatch: true,
            lastViewedAt: progress.lastViewedAt,
        };
    }
    async trackVideoView(userId, videoId, ipAddress, deviceFingerprint) {
        const video = await this.prisma.video.findUnique({
            where: { id: videoId },
            include: { lesson: true },
        });
        if (!video) {
            throw new common_1.ForbiddenException('Video not found');
        }
        const enrollment = await this.prisma.enrollment.findFirst({
            where: {
                userId,
                lessonId: video.lessonId,
            },
        });
        if (!enrollment) {
            throw new common_1.ForbiddenException('Not enrolled in this lesson');
        }
        let progress = await this.prisma.progress.findUnique({
            where: {
                userId_videoId: {
                    userId,
                    videoId,
                },
            },
        });
        if (!progress) {
            progress = await this.prisma.progress.create({
                data: {
                    userId,
                    videoId,
                    viewCount: 1,
                    lastViewedAt: new Date(),
                    ipAddress,
                    deviceFingerprint,
                },
            });
            return {
                viewCount: 1,
                canWatch: true,
                message: 'First view tracked',
            };
        }
        progress = await this.prisma.progress.update({
            where: {
                userId_videoId: {
                    userId,
                    videoId,
                },
            },
            data: {
                viewCount: { increment: 1 },
                lastViewedAt: new Date(),
                ipAddress,
                deviceFingerprint,
            },
        });
        return {
            viewCount: progress.viewCount,
            canWatch: true,
            message: 'View tracked successfully',
        };
    }
    async canWatchVideo(userId, videoId) {
        const video = await this.prisma.video.findUnique({
            where: { id: videoId },
            include: { lesson: true },
        });
        if (!video) {
            return {
                canWatch: false,
                reason: 'Video not found',
            };
        }
        const enrollment = await this.prisma.enrollment.findFirst({
            where: {
                userId,
                lessonId: video.lessonId,
            },
        });
        if (!enrollment) {
            return {
                canWatch: false,
                reason: 'Not enrolled in this lesson',
            };
        }
        const progress = await this.prisma.progress.findUnique({
            where: {
                userId_videoId: {
                    userId,
                    videoId,
                },
            },
        });
        return {
            canWatch: true,
            viewCount: progress?.viewCount || 0,
        };
    }
    async getUserProgress(userId) {
        return this.prisma.progress.findMany({
            where: { userId },
            include: {
                video: {
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
            orderBy: {
                lastViewedAt: 'desc',
            },
        });
    }
    async resetVideoProgress(userId, videoId) {
        const progress = await this.prisma.progress.findUnique({
            where: {
                userId_videoId: {
                    userId,
                    videoId,
                },
            },
        });
        if (!progress) {
            return {
                message: 'No progress found to reset',
            };
        }
        await this.prisma.progress.update({
            where: {
                userId_videoId: {
                    userId,
                    videoId,
                },
            },
            data: {
                viewCount: 0,
                lastViewedAt: new Date(),
            },
        });
        return {
            message: 'View count reset successfully',
            viewCount: 0,
        };
    }
};
exports.ProgressService = ProgressService;
exports.ProgressService = ProgressService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProgressService);
//# sourceMappingURL=progress.service.js.map