import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { phoneNumber: '0999999999' },
    update: {},
    create: {
      phoneNumber: '0999999999',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('✅ Created admin user: 0999999999 / admin123');

  // Create Grades (using 'number' not 'level')
  const grades = await Promise.all([
    prisma.grade.upsert({
      where: { number: 1 },
      update: {},
      create: { number: 1, name: 'Grade 1' },
    }),
    prisma.grade.upsert({
      where: { number: 6 },
      update: {},
      create: { number: 6, name: 'Grade 6' },
    }),
    prisma.grade.upsert({
      where: { number: 10 },
      update: {},
      create: { number: 10, name: 'Grade 10' },
    }),
  ]);

  console.log('✅ Created grades:', grades.length);

  // Create Subjects for Grade 6
  const grade6 = grades.find(g => g.number === 6);
  
  const mathSubject = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      gradeId: grade6!.id,
    },
  });

  const scienceSubject = await prisma.subject.create({
    data: {
      name: 'Science',
      gradeId: grade6!.id,
    },
  });

  console.log('✅ Created subjects');

  // Create Lessons for Mathematics
  const lesson1 = await prisma.lesson.create({
    data: {
      title: 'Introduction to Fractions',
      description: 'Learn the basics of fractions with step-by-step video tutorials',
      subjectId: mathSubject.id,
      price: 500,
      order: 1,
      isPublished: true,
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      title: 'Operations with Fractions',
      description: 'Master adding, subtracting, multiplying, and dividing fractions',
      subjectId: mathSubject.id,
      price: 750,
      order: 2,
      isPublished: true,
    },
  });

  console.log('✅ Created lessons');

  // Create Videos for Lesson 2
  const videos = await Promise.all([
    prisma.video.create({
      data: {
        lessonId: lesson2.id,
        title: 'Introduction to Fraction Operations',
        description: 'Overview of all operations',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 765, // 12:45 in seconds
        order: 1,
      },
    }),
    prisma.video.create({
      data: {
        lessonId: lesson2.id,
        title: 'Adding Fractions with Same Denominators',
        description: 'Learn simple addition',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 1110, // 18:30
        order: 2,
      },
    }),
    prisma.video.create({
      data: {
        lessonId: lesson2.id,
        title: 'Adding Fractions with Different Denominators',
        description: 'Find common denominators',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 1515, // 25:15
        order: 3,
      },
    }),
    prisma.video.create({
      data: {
        lessonId: lesson2.id,
        title: 'Subtracting Fractions',
        description: 'Apply subtraction techniques',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 1360, // 22:40
        order: 4,
      },
    }),
    prisma.video.create({
      data: {
        lessonId: lesson2.id,
        title: 'Multiplying Fractions',
        description: 'Multiply numerators and denominators',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 1210, // 20:10
        order: 5,
      },
    }),
    prisma.video.create({
      data: {
        lessonId: lesson2.id,
        title: 'Dividing Fractions',
        description: 'Use the flip and multiply method',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 1435, // 23:55
        order: 6,
      },
    }),
    prisma.video.create({
      data: {
        lessonId: lesson2.id,
        title: 'Mixed Operations Practice',
        description: 'Combine all operations',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 1710, // 28:30
        order: 7,
      },
    }),
    prisma.video.create({
      data: {
        lessonId: lesson2.id,
        title: 'Real World Word Problems',
        description: 'Apply to everyday situations',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 1820, // 30:20
        order: 8,
      },
    }),
  ]);

  console.log('✅ Created videos:', videos.length);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });