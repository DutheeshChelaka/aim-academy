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

  async findOne(id: string) {
    return this.prisma.subject.findUnique({
      where: { id },
      include: {
        grade: true,
        lessons: {
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: { lessons: true },
        },
      },
    });
  }

  async getLessons(id: string) {
    return this.prisma.lesson.findMany({
      where: { subjectId: id },
      orderBy: {
        order: 'asc',
      },
      include: {
        _count: {
          select: { videos: true },
        },
      },
    });
  }
}