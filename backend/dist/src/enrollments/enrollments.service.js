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
exports.EnrollmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EnrollmentsService = class EnrollmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, lessonId, paymentId) {
        const existing = await this.prisma.enrollment.findFirst({
            where: {
                userId,
                lessonId,
            },
        });
        if (existing) {
            return {
                message: 'Already enrolled in this lesson',
                enrollment: existing,
            };
        }
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
            message: 'Enrolled successfully',
            enrollment,
        };
    }
    async findUserEnrollments(userId) {
        return this.prisma.enrollment.findMany({
            where: { userId },
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
                payment: true,
            },
            orderBy: { enrolledAt: 'desc' },
        });
    }
    async checkEnrollment(lessonId, userId) {
        const enrollment = await this.prisma.enrollment.findFirst({
            where: {
                userId,
                lessonId,
            },
        });
        return {
            isEnrolled: !!enrollment,
            enrollmentId: enrollment?.id || null,
            enrolledAt: enrollment?.enrolledAt || null,
        };
    }
    async findAll() {
        return this.prisma.enrollment.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true,
                    },
                },
                lesson: {
                    include: {
                        subject: {
                            include: {
                                grade: true,
                            },
                        },
                    },
                },
                payment: true,
            },
            orderBy: { enrolledAt: 'desc' },
        });
    }
};
exports.EnrollmentsService = EnrollmentsService;
exports.EnrollmentsService = EnrollmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnrollmentsService);
//# sourceMappingURL=enrollments.service.js.map