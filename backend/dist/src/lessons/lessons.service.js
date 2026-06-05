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
exports.LessonsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LessonsService = class LessonsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.lesson.findMany({
            where: { isPublished: true },
            include: {
                subject: {
                    include: {
                        grade: true,
                    },
                },
                _count: {
                    select: { videos: true },
                },
            },
            orderBy: [
                { subject: { gradeId: 'asc' } },
                { order: 'asc' },
            ],
        });
    }
    async findBySubject(subjectId) {
        return this.prisma.lesson.findMany({
            where: {
                subjectId,
                isPublished: true,
            },
            include: {
                subject: {
                    include: {
                        grade: true,
                    },
                },
                _count: {
                    select: { videos: true },
                },
            },
            orderBy: {
                order: 'asc',
            },
        });
    }
    async findByGrade(gradeId) {
        return this.prisma.lesson.findMany({
            where: {
                subject: {
                    gradeId,
                },
                isPublished: true,
            },
            include: {
                subject: {
                    include: {
                        grade: true,
                    },
                },
                _count: {
                    select: { videos: true },
                },
            },
            orderBy: [
                { subject: { name: 'asc' } },
                { order: 'asc' },
            ],
        });
    }
    async findOne(id, userId) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
            include: {
                subject: {
                    include: {
                        grade: true,
                    },
                },
                videos: {
                    orderBy: {
                        order: 'asc',
                    },
                },
                _count: {
                    select: { videos: true },
                },
            },
        });
        if (!lesson) {
            throw new common_1.NotFoundException(`Lesson with ID ${id} not found`);
        }
        if (!lesson.isPublished) {
            if (userId) {
                const enrollment = await this.prisma.enrollment.findFirst({
                    where: {
                        lessonId: id,
                        userId,
                    },
                });
                if (!enrollment) {
                    throw new common_1.ForbiddenException('This lesson is not available');
                }
            }
            else {
                throw new common_1.ForbiddenException('This lesson is not available');
            }
        }
        return lesson;
    }
    async getVideos(id, userId) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
        });
        if (!lesson) {
            throw new common_1.NotFoundException(`Lesson with ID ${id} not found`);
        }
        if (!lesson.isPublished) {
            if (userId) {
                const enrollment = await this.prisma.enrollment.findFirst({
                    where: {
                        lessonId: id,
                        userId,
                    },
                });
                if (!enrollment) {
                    throw new common_1.ForbiddenException('This lesson is not available');
                }
            }
            else {
                throw new common_1.ForbiddenException('This lesson is not available');
            }
        }
        return this.prisma.video.findMany({
            where: { lessonId: id },
            orderBy: {
                order: 'asc',
            },
        });
    }
    async checkUserAccess(lessonId, userId) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
        });
        if (!lesson) {
            throw new common_1.NotFoundException(`Lesson with ID ${lessonId} not found`);
        }
        const enrollment = await this.prisma.enrollment.findFirst({
            where: {
                lessonId,
                userId,
            },
        });
        return {
            hasAccess: !!enrollment,
            isPublished: lesson.isPublished,
            enrollment,
        };
    }
    async getUserEnrolledLessons(userId) {
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                userId,
            },
            include: {
                lesson: {
                    include: {
                        subject: {
                            include: {
                                grade: true,
                            },
                        },
                        _count: {
                            select: { videos: true },
                        },
                    },
                },
            },
            orderBy: {
                enrolledAt: 'desc',
            },
        });
        return enrollments.map((enrollment) => ({
            ...enrollment.lesson,
            enrolledAt: enrollment.enrolledAt,
            expiresAt: enrollment.expiresAt,
        }));
    }
};
exports.LessonsService = LessonsService;
exports.LessonsService = LessonsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LessonsService);
//# sourceMappingURL=lessons.service.js.map