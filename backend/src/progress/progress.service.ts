import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async trackView(userId: string, videoId: string, deviceFingerprint?: string, ipAddress?: string) {
    // Get video details
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: {
        lesson: true,
      },
    });

    if (!video) {
      throw new BadRequestException('Video not found');
    }

    // Check enrollment
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        lessonId: video.lessonId,
      },
    });

    if (!enrollment) {
      throw new BadRequestException('Not enrolled in this lesson');
    }

    // Get or create progress
    let progress = await this.prisma.progress.findFirst({
      where: {
        userId,
        videoId,
      },
    });

    if (!progress) {
      // Create new progress
      progress = await this.prisma.progress.create({
        data: {
          userId,
          videoId,
          viewCount: 1,
          lastViewedAt: new Date(),
          deviceFingerprint,
          ipAddress,
        },
      });
    } else {
      // Check view limit
      if (progress.viewCount >= 2) {
        throw new BadRequestException('View limit reached for this video');
      }

      // Increment view count
      progress = await this.prisma.progress.update({
        where: { id: progress.id },
        data: {
          viewCount: progress.viewCount + 1,
          lastViewedAt: new Date(),
        },
      });
    }

    return progress;
  }

  async getVideoProgress(userId: string, videoId: string) {
    const progress = await this.prisma.progress.findFirst({
      where: {
        userId,
        videoId,
      },
    });

    return {
      viewCount: progress?.viewCount || 0,
      maxViews: 2,
      canWatch: !progress || progress.viewCount < 2,
      lastViewedAt: progress?.lastViewedAt,
    };
  }

  async getLessonProgress(userId: string, lessonId: string) {
    const videos = await this.prisma.video.findMany({
      where: { lessonId },
      select: { id: true },
    });

    const videoIds = videos.map(v => v.id);

    const progressRecords = await this.prisma.progress.findMany({
      where: {
        userId,
        videoId: { in: videoIds },
      },
    });

    const totalVideos = videos.length;
    const watchedVideos = progressRecords.filter(p => p.viewCount > 0).length;
    const completedVideos = progressRecords.filter(p => p.viewCount >= 2).length;

    return {
      totalVideos,
      watchedVideos,
      completedVideos,
      progressPercentage: totalVideos > 0 ? (watchedVideos / totalVideos) * 100 : 0,
    };
  }

  async getUserProgress(userId: string) {
    return this.prisma.progress.findMany({
      where: { userId },
      include: {
        video: {
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
        },
      },
      orderBy: {
        lastViewedAt: 'desc',
      },
    });
  }
}