import { Controller, Get, Post, Body, Param, Request, UseGuards, Ip } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class TrackViewDto {
  videoId: string;
  deviceFingerprint?: string;
}

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('track')
  @UseGuards(JwtAuthGuard)
  trackView(@Request() req, @Body() trackViewDto: TrackViewDto, @Ip() ip: string) {
    return this.progressService.trackView(
      req.user.userId,
      trackViewDto.videoId,
      trackViewDto.deviceFingerprint,
      ip,
    );
  }

  @Get('video/:videoId')
  @UseGuards(JwtAuthGuard)
  getVideoProgress(@Request() req, @Param('videoId') videoId: string) {
    return this.progressService.getVideoProgress(req.user.userId, videoId);
  }

  @Get('lesson/:lessonId')
  @UseGuards(JwtAuthGuard)
  getLessonProgress(@Request() req, @Param('lessonId') lessonId: string) {
    return this.progressService.getLessonProgress(req.user.userId, lessonId);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  getUserProgress(@Request() req) {
    return this.progressService.getUserProgress(req.user.userId);
  }
}