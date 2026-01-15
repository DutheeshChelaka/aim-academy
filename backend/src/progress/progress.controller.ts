import {
  Controller,
  Get,
  Post,
  Param,
  Request,
  UseGuards,
  Ip,
  Headers,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  /**
   * Get video progress for current user
   * GET /progress/:videoId
   */
  @Get(':videoId')
  async getVideoProgress(@Param('videoId') videoId: string, @Request() req) {
    return this.progressService.getVideoProgress(req.user.userId, videoId);
  }

  /**
   * Track video view (increment view count)
   * POST /progress/:videoId/track
   */
  @Post(':videoId/track')
  async trackVideoView(
    @Param('videoId') videoId: string,
    @Request() req,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    // Simple device fingerprint (can be enhanced)
    const deviceFingerprint = `${userAgent}-${ipAddress}`;

    return this.progressService.trackVideoView(
      req.user.userId,
      videoId,
      ipAddress,
      deviceFingerprint,
    );
  }

  /**
   * Check if user can watch video
   * GET /progress/:videoId/can-watch
   */
  @Get(':videoId/can-watch')
  async canWatchVideo(@Param('videoId') videoId: string, @Request() req) {
    return this.progressService.canWatchVideo(req.user.userId, videoId);
  }

  /**
   * Get all progress for current user
   * GET /progress
   */
  @Get()
  async getUserProgress(@Request() req) {
    return this.progressService.getUserProgress(req.user.userId);
  }

  /**
   * Reset view count (admin only - add RolesGuard later)
   * POST /progress/:videoId/reset
   */
  @Post(':videoId/reset')
  async resetProgress(
    @Param('videoId') videoId: string,
    @Request() req,
  ) {
    // TODO: Add admin role guard
    return this.progressService.resetVideoProgress(req.user.userId, videoId);
  }
}