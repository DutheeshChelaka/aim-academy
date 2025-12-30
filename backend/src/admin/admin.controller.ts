import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ========== STATS ==========
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // ========== GRADES ==========
  @Get('grades')
  getAllGrades() {
    return this.adminService.getAllGrades();
  }

  @Post('grades')
  createGrade(@Body() body: { number: number; name: string }) {
    return this.adminService.createGrade(body.number, body.name);
  }

  @Put('grades/:id')
  updateGrade(@Param('id') id: string, @Body() body: { number: number; name: string }) {
    return this.adminService.updateGrade(id, body.number, body.name);
  }

  @Delete('grades/:id')
  deleteGrade(@Param('id') id: string) {
    return this.adminService.deleteGrade(id);
  }

  // ========== SUBJECTS ==========
  @Get('subjects')
  getAllSubjects() {
    return this.adminService.getAllSubjects();
  }

  @Post('subjects')
  createSubject(@Body() body: { name: string; gradeId: string }) {
    return this.adminService.createSubject(body.name, body.gradeId);
  }

  @Put('subjects/:id')
  updateSubject(@Param('id') id: string, @Body() body: { name: string; gradeId: string }) {
    return this.adminService.updateSubject(id, body.name, body.gradeId);
  }

  @Delete('subjects/:id')
  deleteSubject(@Param('id') id: string) {
    return this.adminService.deleteSubject(id);
  }

  // ========== LESSONS ==========
  @Get('lessons')
  getAllLessons() {
    return this.adminService.getAllLessons();
  }

  @Post('lessons')
  createLesson(@Body() body: {
    title: string;
    description: string;
    subjectId: string;
    price: number;
    order: number;
    thumbnailUrl?: string;
  }) {
    return this.adminService.createLesson(
      body.title,
      body.description,
      body.subjectId,
      body.price,
      body.order,
      body.thumbnailUrl,
    );
  }

  @Put('lessons/:id')
  updateLesson(@Param('id') id: string, @Body() body: {
    title: string;
    description: string;
    subjectId: string;
    price: number;
    order: number;
    thumbnailUrl?: string;
    isPublished?: boolean;
  }) {
    return this.adminService.updateLesson(
      id,
      body.title,
      body.description,
      body.subjectId,
      body.price,
      body.order,
      body.thumbnailUrl,
      body.isPublished,
    );
  }

  @Delete('lessons/:id')
  deleteLesson(@Param('id') id: string) {
    return this.adminService.deleteLesson(id);
  }

  // ========== VIDEOS ==========
  @Get('videos')
  getAllVideos() {
    return this.adminService.getAllVideos();
  }

  @Get('videos/lesson/:lessonId')
  getVideosByLesson(@Param('lessonId') lessonId: string) {
    return this.adminService.getVideosByLesson(lessonId);
  }

  @Post('videos')
  createVideo(@Body() body: {
    lessonId: string;
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
    order: number;
  }) {
    return this.adminService.createVideo(
      body.lessonId,
      body.title,
      body.description,
      body.videoUrl,
      body.duration,
      body.order,
    );
  }

  @Put('videos/:id')
  updateVideo(@Param('id') id: string, @Body() body: {
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
    order: number;
  }) {
    return this.adminService.updateVideo(
      id,
      body.title,
      body.description,
      body.videoUrl,
      body.duration,
      body.order,
    );
  }

  @Delete('videos/:id')
  deleteVideo(@Param('id') id: string) {
    return this.adminService.deleteVideo(id);
  }

  // ========== STUDENTS ==========
  @Get('students')
  getAllStudents() {
    return this.adminService.getAllStudents();
  }

  // ========== ENROLLMENTS ==========
  @Get('enrollments')
  getAllEnrollments() {
    return this.adminService.getAllEnrollments();
  }
}