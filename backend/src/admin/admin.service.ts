import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
      api_key: process.env.CLOUDINARY_API_KEY || 'demo',
      api_secret: process.env.CLOUDINARY_API_SECRET || 'demo',
    });
  }

  // ========== GRADES ==========
  async createGrade(number: number, name: string) {
    const existing = await this.prisma.grade.findUnique({
      where: { number },
    });

    if (existing) {
      throw new BadRequestException('Grade already exists');
    }

    return this.prisma.grade.create({
      data: { number, name },
    });
  }

  async updateGrade(id: string, number: number, name: string) {
    return this.prisma.grade.update({
      where: { id },
      data: { number, name },
    });
  }

  async deleteGrade(id: string) {
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

  // ========== SUBJECTS ==========
  async createSubject(name: string, gradeId: string) {
    return this.prisma.subject.create({
      data: { name, gradeId },
      include: { grade: true },
    });
  }

  async updateSubject(id: string, name: string, gradeId: string) {
    return this.prisma.subject.update({
      where: { id },
      data: { name, gradeId },
      include: { grade: true },
    });
  }

  async deleteSubject(id: string) {
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

  // ========== LESSONS ==========
  async createLesson(
    title: string,
    description: string,
    subjectId: string,
    price: number,
    order: number,
    thumbnailUrl?: string,
  ) {
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

  async updateLesson(
    id: string,
    title: string,
    description: string,
    subjectId: string,
    price: number,
    order: number,
    thumbnailUrl?: string,
    isPublished?: boolean,
  ) {
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

  async deleteLesson(id: string) {
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

  // ========== VIDEOS ==========
  async createVideo(
    lessonId: string,
    title: string,
    description: string,
    videoUrl: string,
    duration: number,
    order: number,
  ) {
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

  async updateVideo(
    id: string,
    title: string,
    description: string,
    videoUrl: string,
    duration: number,
    order: number,
  ) {
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

  async deleteVideo(id: string) {
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

  async getVideosByLesson(lessonId: string) {
    return this.prisma.video.findMany({
      where: { lessonId },
      orderBy: { order: 'asc' },
    });
  }

  // ========== FILE UPLOAD ==========
  async uploadThumbnail(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    try {
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'aim-academy/lessons',
            transformation: [
              { width: 800, height: 600, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        const readable = Readable.from(file.buffer);
        readable.pipe(uploadStream);
      });

      return {
        url: (result as any).secure_url,
        publicId: (result as any).public_id,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new BadRequestException('Failed to upload image');
    }
  }

  // ========== STATS ==========
  async getStats() {
    const [
      totalStudents,
      totalGrades,
      totalSubjects,
      totalLessons,
      totalVideos,
      totalEnrollments,
      recentEnrollments,
    ] = await Promise.all([
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

  // ========== STUDENTS ==========
  async getAllStudents() {
    return this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ========== ENROLLMENTS ==========
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
}