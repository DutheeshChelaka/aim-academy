import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

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

  async findOne(id: string) {
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

    return lesson;
  }

  async getVideos(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return this.prisma.video.findMany({
      where: { lessonId: id },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async checkUserAccess(lessonId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        lessonId,
        userId,
      },
    });

    return {
      hasAccess: !!enrollment,
      enrollment,
    };
  }
}