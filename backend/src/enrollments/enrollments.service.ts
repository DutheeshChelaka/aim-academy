import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, lessonId: string, paymentId?: string) {
    // Check if user is already enrolled
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

    // Create enrollment
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

  async findUserEnrollments(userId: string) {
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

  async checkEnrollment(lessonId: string, userId: string) {
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
}