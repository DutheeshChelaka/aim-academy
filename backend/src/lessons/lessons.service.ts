import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all PUBLISHED lessons (for regular users)
   */
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

  /**
   * Get PUBLISHED lessons by subject (for regular users)
   */
  async findBySubject(subjectId: string) {
    return this.prisma.lesson.findMany({
      where: { 
        subjectId,
        isPublished: true, // ✅ Only published lessons
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

  /**
   * Get PUBLISHED lessons by grade (for regular users)
   */
  async findByGrade(gradeId: string) {
    return this.prisma.lesson.findMany({
      where: {
        subject: {
          gradeId,
        },
        isPublished: true, // ✅ Only published lessons
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

  /**
   * Get a single lesson by ID
   * ✅ IMPORTANT: Users can only access if:
   *    - Lesson is published, OR
   *    - User has already purchased it (enrolled)
   */
  async findOne(id: string, userId?: string) {
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
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    // ✅ Check if lesson is published
    if (!lesson.isPublished) {
      // If not published, check if user has purchased it
      if (userId) {
        const enrollment = await this.prisma.enrollment.findFirst({
          where: {
            lessonId: id,
            userId,
          },
        });

        // ✅ User can access if enrolled, even if unpublished
        if (!enrollment) {
          throw new ForbiddenException('This lesson is not available');
        }
      } else {
        // No userId provided and lesson unpublished
        throw new ForbiddenException('This lesson is not available');
      }
    }

    return lesson;
  }

  /**
   * Get videos for a lesson
   * ✅ Check if user has access before returning videos
   */
  async getVideos(id: string, userId?: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    // ✅ Check if lesson is published OR user is enrolled
    if (!lesson.isPublished) {
      if (userId) {
        const enrollment = await this.prisma.enrollment.findFirst({
          where: {
            lessonId: id,
            userId,
          },
        });

        if (!enrollment) {
          throw new ForbiddenException('This lesson is not available');
        }
      } else {
        throw new ForbiddenException('This lesson is not available');
      }
    }

    return this.prisma.video.findMany({
      where: { lessonId: id },
      orderBy: {
        order: 'asc',
      },
    });
  }

  /**
   * Check if user has access to a lesson
   * ✅ User has access if enrolled (even if lesson is unpublished)
   */
  async checkUserAccess(lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        lessonId,
        userId,
      },
    });

    return {
      hasAccess: !!enrollment, // ✅ Access if enrolled (regardless of publish status)
      isPublished: lesson.isPublished,
      enrollment,
    };
  }

  /**
   * Get user's enrolled lessons
   * ✅ Shows ALL enrolled lessons (published + unpublished)
   * Frontend can show "Draft" badge for unpublished ones
   */
  async getUserEnrolledLessons(userId: string) {
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
}