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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
            api_key: process.env.CLOUDINARY_API_KEY || 'demo',
            api_secret: process.env.CLOUDINARY_API_SECRET || 'demo',
        });
    }
    async createGrade(number, name) {
        const existing = await this.prisma.grade.findUnique({
            where: { number },
        });
        if (existing) {
            throw new common_1.BadRequestException('Grade already exists');
        }
        return this.prisma.grade.create({
            data: { number, name },
        });
    }
    async updateGrade(id, number, name) {
        return this.prisma.grade.update({
            where: { id },
            data: { number, name },
        });
    }
    async deleteGrade(id) {
        return this.prisma.grade.delete({
            where: { id },
        });
    }
    async getAllGrades() {
        return this.prisma.grade.findMany({
            include: {
                _count: {
                    select: { subjects: true },
                },
            },
            orderBy: { number: 'asc' },
        });
    }
    async createSubject(name, gradeId, thumbnailUrl) {
        return this.prisma.subject.create({
            data: {
                name,
                gradeId,
                thumbnailUrl,
            },
            include: {
                grade: true,
                _count: {
                    select: { lessons: true },
                },
            },
        });
    }
    async updateSubject(id, name, gradeId, thumbnailUrl) {
        return this.prisma.subject.update({
            where: { id },
            data: {
                name,
                gradeId,
                thumbnailUrl,
            },
            include: {
                grade: true,
                _count: {
                    select: { lessons: true },
                },
            },
        });
    }
    async deleteSubject(id) {
        return this.prisma.subject.delete({
            where: { id },
        });
    }
    async getAllSubjects() {
        return this.prisma.subject.findMany({
            include: {
                grade: true,
                _count: {
                    select: { lessons: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async createLesson(title, description, subjectId, price, order, thumbnailUrl) {
        return this.prisma.lesson.create({
            data: {
                title,
                description,
                subjectId,
                price,
                order,
                thumbnailUrl,
                isPublished: true,
            },
            include: {
                subject: {
                    include: { grade: true },
                },
            },
        });
    }
    async updateLesson(id, title, description, subjectId, price, order, thumbnailUrl, isPublished) {
        return this.prisma.lesson.update({
            where: { id },
            data: {
                title,
                description,
                subjectId,
                price,
                order,
                thumbnailUrl,
                isPublished,
            },
            include: {
                subject: {
                    include: { grade: true },
                },
            },
        });
    }
    async deleteLesson(id) {
        return this.prisma.lesson.delete({
            where: { id },
        });
    }
    async getAllLessons() {
        return this.prisma.lesson.findMany({
            include: {
                subject: {
                    include: { grade: true },
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
    async createVideo(lessonId, title, description, videoUrl, duration, order) {
        return this.prisma.video.create({
            data: {
                lessonId,
                title,
                description,
                videoUrl,
                duration,
                order,
            },
            include: {
                lesson: true,
            },
        });
    }
    async updateVideo(id, title, description, videoUrl, duration, order) {
        return this.prisma.video.update({
            where: { id },
            data: {
                title,
                description,
                videoUrl,
                duration,
                order,
            },
            include: {
                lesson: true,
            },
        });
    }
    async deleteVideo(id) {
        return this.prisma.video.delete({
            where: { id },
        });
    }
    async getAllVideos() {
        return this.prisma.video.findMany({
            include: {
                lesson: {
                    include: {
                        subject: {
                            include: { grade: true },
                        },
                    },
                },
            },
            orderBy: { order: 'asc' },
        });
    }
    async getVideosByLesson(lessonId) {
        return this.prisma.video.findMany({
            where: { lessonId },
            orderBy: { order: 'asc' },
        });
    }
    async uploadThumbnail(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Only JPEG, PNG, and WebP images are allowed');
        }
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('File size must be less than 5MB');
        }
        try {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                    folder: 'aim-academy/lessons',
                    transformation: [
                        { width: 800, height: 600, crop: 'limit' },
                        { quality: 'auto' },
                        { fetch_format: 'auto' },
                    ],
                }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
                const readable = stream_1.Readable.from(file.buffer);
                readable.pipe(uploadStream);
            });
            return {
                url: result.secure_url,
                publicId: result.public_id,
            };
        }
        catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new common_1.BadRequestException('Failed to upload image');
        }
    }
    async getStats() {
        const [totalStudents, totalGrades, totalSubjects, totalLessons, totalVideos, totalEnrollments, recentEnrollments,] = await Promise.all([
            this.prisma.user.count({ where: { role: 'STUDENT' } }),
            this.prisma.grade.count(),
            this.prisma.subject.count(),
            this.prisma.lesson.count(),
            this.prisma.video.count(),
            this.prisma.enrollment.count(),
            this.prisma.enrollment.findMany({
                take: 10,
                orderBy: { enrolledAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, name: true, phoneNumber: true },
                    },
                    lesson: {
                        include: {
                            subject: {
                                include: { grade: true },
                            },
                        },
                    },
                },
            }),
        ]);
        return {
            totalStudents,
            totalGrades,
            totalSubjects,
            totalLessons,
            totalVideos,
            totalEnrollments,
            recentEnrollments,
        };
    }
    async getAllStudents() {
        return this.prisma.user.findMany({
            where: { role: 'STUDENT' },
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
                    orderBy: {
                        enrolledAt: 'desc',
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async deleteStudent(id) {
        return this.prisma.user.delete({
            where: { id },
        });
    }
    async getAllEnrollments() {
        return this.prisma.enrollment.findMany({
            include: {
                user: {
                    select: { id: true, name: true, phoneNumber: true },
                },
                lesson: {
                    include: {
                        subject: {
                            include: { grade: true },
                        },
                    },
                },
                payment: true,
            },
            orderBy: { enrolledAt: 'desc' },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map