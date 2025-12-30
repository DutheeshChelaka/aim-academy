import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() body: { lessonId: string; paymentId?: string }) {
    return this.enrollmentsService.create(
      req.user.userId,
      body.lessonId,
      body.paymentId,
    );
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyEnrollments(@Request() req) {
    return this.enrollmentsService.findUserEnrollments(req.user.userId);
  }

  @Get('check/:lessonId')
  @UseGuards(JwtAuthGuard)
  checkEnrollment(@Param('lessonId') lessonId: string, @Request() req) {
    return this.enrollmentsService.checkEnrollment(lessonId, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.enrollmentsService.findAll();
  }
}