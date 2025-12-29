import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.grade.findMany({
      orderBy: {
        number: 'asc',
      },
      include: {
        _count: {
          select: { subjects: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.grade.findUnique({
      where: { id },
      include: {
        subjects: true,
        _count: {
          select: { subjects: true },
        },
      },
    });
  }

  async getSubjects(id: string) {
    return this.prisma.subject.findMany({
      where: { gradeId: id },
      include: {
        _count: {
          select: { lessons: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}