import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, lessonId: string, paymentId?: string) {
    // Check if lesson exists
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        lessonId,
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('Already enrolled in this lesson');
    }

    // Create enrollment
    return this.prisma.enrollment.create({
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
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });
  }

  async checkEnrollment(userId: string, lessonId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        lessonId,
      },
    });

    return {
      isEnrolled: !!enrollment,
      enrollment,
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
      orderBy: {
        enrolledAt: 'desc',
      },
    });
  }
}