import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // ✅ ADD THIS
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { GradesModule } from './grades/grades.module';
import { SubjectsModule } from './subjects/subjects.module';
import { LessonsModule } from './lessons/lessons.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { ProgressModule } from './progress/progress.module';
import { AdminModule } from './admin/admin.module';
import { EmailModule } from './email/email.module'; // ✅ ADD THIS
import { PaymentsModule } from './payments/payments.module'; // Add this



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ✅ Makes env variables available everywhere
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    GradesModule,
    SubjectsModule,
    LessonsModule,
    EnrollmentsModule,
    ProgressModule,
    AdminModule,
    EmailModule, // ✅ ADD THIS
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}