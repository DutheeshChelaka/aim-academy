import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.subject.findMany({
      include: {
        grade: true,
        _count: {
          select: { lessons: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get single subject by ID
   * ✅ UPDATED: Now filters lessons by isPublished
   */
  async findOne(id: string) {
    return this.prisma.subject.findUnique({
      where: { id },
      include: {
        grade: true,
        lessons: {
          where: {
            isPublished: true, // ✅ ADDED: Only return published lessons
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: { 
            lessons: {
              where: {
                isPublished: true, // ✅ ADDED: Count only published lessons
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get published lessons for a subject
   * ✅ CORRECT: Already filters by isPublished
   */
  async getLessons(id: string) {
    return this.prisma.lesson.findMany({
      where: { 
        subjectId: id,
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
}