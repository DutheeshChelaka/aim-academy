"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting seed...');
    const adminPhone = process.env.ADMIN_PHONE;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPhone || !adminEmail || !adminPassword) {
        throw new Error('❌ Missing admin credentials in environment variables! Please set ADMIN_PHONE, ADMIN_EMAIL, and ADMIN_PASSWORD');
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.upsert({
        where: { phoneNumber: adminPhone },
        update: {},
        create: {
            phoneNumber: adminPhone,
            email: adminEmail,
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN',
            isVerified: true,
        },
    });
    console.log('✅ Created admin user:');
    console.log('   Phone: ' + adminPhone);
    console.log('   Email: ' + adminEmail);
    console.log('   Password: [HIDDEN]');
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
        prisma.grade.upsert({
            where: { number: 11 },
            update: {},
            create: { number: 11, name: 'Grade 11' },
        }),
    ]);
    console.log('✅ Created grades:', grades.length);
    const grade6 = grades.find(g => g.number === 6);
    const mathSubject = await prisma.subject.upsert({
        where: { id: 'math-grade-6' },
        update: {},
        create: {
            id: 'math-grade-6',
            name: 'Mathematics',
            gradeId: grade6.id,
        },
    });
    const scienceSubject = await prisma.subject.upsert({
        where: { id: 'science-grade-6' },
        update: {},
        create: {
            id: 'science-grade-6',
            name: 'Science',
            gradeId: grade6.id,
        },
    });
    console.log('✅ Created subjects');
    const lesson1 = await prisma.lesson.upsert({
        where: { id: 'lesson-fractions-intro' },
        update: {},
        create: {
            id: 'lesson-fractions-intro',
            title: 'Introduction to Fractions',
            description: 'Learn the basics of fractions with step-by-step video tutorials',
            subjectId: mathSubject.id,
            price: 500,
            order: 1,
            isPublished: true,
        },
    });
    const lesson2 = await prisma.lesson.upsert({
        where: { id: 'lesson-fraction-operations' },
        update: {},
        create: {
            id: 'lesson-fraction-operations',
            title: 'Operations with Fractions',
            description: 'Master adding, subtracting, multiplying, and dividing fractions',
            subjectId: mathSubject.id,
            price: 750,
            order: 2,
            isPublished: true,
        },
    });
    console.log('✅ Created lessons');
    const videoData = [
        {
            id: 'video-1',
            title: 'Introduction to Fraction Operations',
            description: 'Overview of all operations',
            duration: 765,
            order: 1,
        },
        {
            id: 'video-2',
            title: 'Adding Fractions with Same Denominators',
            description: 'Learn simple addition',
            duration: 1110,
            order: 2,
        },
        {
            id: 'video-3',
            title: 'Adding Fractions with Different Denominators',
            description: 'Find common denominators',
            duration: 1515,
            order: 3,
        },
        {
            id: 'video-4',
            title: 'Subtracting Fractions',
            description: 'Apply subtraction techniques',
            duration: 1360,
            order: 4,
        },
        {
            id: 'video-5',
            title: 'Multiplying Fractions',
            description: 'Multiply numerators and denominators',
            duration: 1210,
            order: 5,
        },
        {
            id: 'video-6',
            title: 'Dividing Fractions',
            description: 'Use the flip and multiply method',
            duration: 1435,
            order: 6,
        },
        {
            id: 'video-7',
            title: 'Mixed Operations Practice',
            description: 'Combine all operations',
            duration: 1710,
            order: 7,
        },
        {
            id: 'video-8',
            title: 'Real World Word Problems',
            description: 'Apply to everyday situations',
            duration: 1820,
            order: 8,
        },
    ];
    for (const video of videoData) {
        await prisma.video.upsert({
            where: { id: video.id },
            update: {},
            create: {
                ...video,
                lessonId: lesson2.id,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            },
        });
    }
    console.log('✅ Created videos:', videoData.length);
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
//# sourceMappingURL=seed.js.map