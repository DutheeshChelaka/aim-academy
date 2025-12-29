import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  findAll() {
    return this.lessonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Get(':id/videos')
  @UseGuards(JwtAuthGuard)
  getVideos(@Param('id') id: string) {
    return this.lessonsService.getVideos(id);
  }

  @Get(':id/access')
  @UseGuards(JwtAuthGuard)
  checkAccess(@Param('id') id: string, @Request() req) {
    return this.lessonsService.checkUserAccess(id, req.user.userId);
  }
}