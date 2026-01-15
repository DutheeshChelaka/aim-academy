import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// ✅ CONSTANT for easy future changes
const MAX_VIEWS = 5;

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get video progress for a user
   */
  async getVideoProgress(userId: string, videoId: string) {
    // Check if user is enrolled in the lesson
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: { lesson: true },
    });

    if (!video) {
      throw new ForbiddenException('Video not found');
    }

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        lessonId: video.lessonId,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('Not enrolled in this lesson');
    }

    // Get or create progress record
    let progress = await this.prisma.progress.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    // If no progress exists, create initial record
    if (!progress) {
      progress = await this.prisma.progress.create({
        data: {
          userId,
          videoId,
          viewCount: 0,
          lastViewedAt: new Date(),
        },
      });
    }

    const viewsRemaining = Math.max(0, MAX_VIEWS - progress.viewCount);
    const canWatch = progress.viewCount < MAX_VIEWS;

    return {
      viewCount: progress.viewCount,
      viewsRemaining,
      canWatch,
      lastViewedAt: progress.lastViewedAt,
      maxViews: MAX_VIEWS,
    };
  }

  /**
   * Track video view (increment view count)
   */
  async trackVideoView(
    userId: string,
    videoId: string,
    ipAddress?: string,
    deviceFingerprint?: string,
  ) {
    // Check if user is enrolled
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: { lesson: true },
    });

    if (!video) {
      throw new ForbiddenException('Video not found');
    }

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        lessonId: video.lessonId,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('Not enrolled in this lesson');
    }

    // Get current progress
    let progress = await this.prisma.progress.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    // If no progress, create it
    if (!progress) {
      progress = await this.prisma.progress.create({
        data: {
          userId,
          videoId,
          viewCount: 1,
          lastViewedAt: new Date(),
          ipAddress,
          deviceFingerprint,
        },
      });

      return {
        viewCount: 1,
        viewsRemaining: MAX_VIEWS - 1,
        canWatch: true,
        maxViews: MAX_VIEWS,
        message: 'First view tracked',
      };
    }

    // Check if already at limit
    if (progress.viewCount >= MAX_VIEWS) {
      return {
        viewCount: progress.viewCount,
        viewsRemaining: 0,
        canWatch: false,
        maxViews: MAX_VIEWS,
        message: 'View limit already reached',
      };
    }

    // Increment view count
    progress = await this.prisma.progress.update({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
        ipAddress,
        deviceFingerprint,
      },
    });

    const viewsRemaining = Math.max(0, MAX_VIEWS - progress.viewCount);
    const canWatch = progress.viewCount < MAX_VIEWS;

    return {
      viewCount: progress.viewCount,
      viewsRemaining,
      canWatch,
      maxViews: MAX_VIEWS,
      message:
        progress.viewCount >= MAX_VIEWS
          ? 'Final view used. No more views remaining.'
          : 'View tracked successfully',
    };
  }

  /**
   * Check if user can watch video (quick check)
   */
  async canWatchVideo(userId: string, videoId: string) {
    // Check enrollment
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: { lesson: true },
    });

    if (!video) {
      return {
        canWatch: false,
        reason: 'Video not found',
      };
    }

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        lessonId: video.lessonId,
      },
    });

    if (!enrollment) {
      return {
        canWatch: false,
        reason: 'Not enrolled in this lesson',
      };
    }

    // Check view count
    const progress = await this.prisma.progress.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    if (!progress || progress.viewCount < MAX_VIEWS) {
      return {
        canWatch: true,
        viewCount: progress?.viewCount || 0,
        viewsRemaining: MAX_VIEWS - (progress?.viewCount || 0),
        maxViews: MAX_VIEWS,
      };
    }

    return {
      canWatch: false,
      reason: 'View limit reached',
      viewCount: progress.viewCount,
      viewsRemaining: 0,
      maxViews: MAX_VIEWS,
    };
  }

  /**
   * Get all progress for a user (admin/analytics)
   */
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

  /**
   * Reset view count for a video (admin only)
   */
  async resetVideoProgress(userId: string, videoId: string) {
    const progress = await this.prisma.progress.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    if (!progress) {
      return {
        message: 'No progress found to reset',
      };
    }

    await this.prisma.progress.update({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
      data: {
        viewCount: 0,
        lastViewedAt: new Date(),
      },
    });

    return {
      message: 'View count reset successfully',
      viewCount: 0,
      viewsRemaining: MAX_VIEWS,
      maxViews: MAX_VIEWS,
    };
  }
}