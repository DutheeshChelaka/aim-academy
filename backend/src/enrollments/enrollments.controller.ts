import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateEnrollmentDto {
  lessonId: string;
  paymentId?: string;
}

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(
      req.user.userId,
      createEnrollmentDto.lessonId,
      createEnrollmentDto.paymentId,
    );
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  findUserEnrollments(@Request() req) {
    return this.enrollmentsService.findUserEnrollments(req.user.userId);
  }

  @Get('check/:lessonId')
  @UseGuards(JwtAuthGuard)
  checkEnrollment(@Request() req, @Param('lessonId') lessonId: string) {
    return this.enrollmentsService.checkEnrollment(req.user.userId, lessonId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.enrollmentsService.findAll();
  }
}