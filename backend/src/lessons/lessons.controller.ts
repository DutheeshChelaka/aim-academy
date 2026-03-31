import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard'; // ✅ NEW

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  /**
   * Get all published lessons (public)
   */
  @Get()
  findAll() {
    return this.lessonsService.findAll();
  }

  /**
   * Get published lessons by subject (public)
   */
  @Get('subject/:subjectId')
  findBySubject(@Param('subjectId') subjectId: string) {
    return this.lessonsService.findBySubject(subjectId);
  }

  /**
   * Get published lessons by grade (public)
   */
  @Get('grade/:gradeId')
  findByGrade(@Param('gradeId') gradeId: string) {
    return this.lessonsService.findByGrade(gradeId);
  }

  /**
   * Get user's enrolled lessons (requires auth)
   */
  @Get('my/enrolled')
  @UseGuards(JwtAuthGuard)
  getMyEnrolledLessons(@Request() req) {
    return this.lessonsService.getUserEnrolledLessons(req.user.userId);
  }

  /**
   * Get single lesson by ID
   * ✅ Uses OptionalJwtAuthGuard to allow both authenticated and public access
   * ✅ If user is logged in, checks enrollment for unpublished lessons
   */
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId; // Optional userId
    return this.lessonsService.findOne(id, userId);
  }

  /**
   * Get videos for a lesson (requires auth)
   */
  @Get(':id/videos')
  @UseGuards(JwtAuthGuard)
  getVideos(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    return this.lessonsService.getVideos(id, userId);
  }

  /**
   * Check user access to a lesson (requires auth)
   */
  @Get(':id/access')
  @UseGuards(JwtAuthGuard)
  checkAccess(@Param('id') id: string, @Request() req) {
    return this.lessonsService.checkUserAccess(id, req.user.userId);
  }
}