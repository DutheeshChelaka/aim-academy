import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getStats(): Promise<{
        totalStudents: number;
        totalGrades: number;
        totalSubjects: number;
        totalLessons: number;
        totalVideos: number;
        totalEnrollments: number;
        recentEnrollments: ({
            user: {
                id: string;
                phoneNumber: string | null;
                name: string;
            };
            lesson: {
                subject: {
                    grade: {
                        number: number;
                        id: string;
                        name: string;
                        createdAt: Date;
                    };
                } & {
                    id: string;
                    name: string;
                    createdAt: Date;
                    gradeId: string;
                    thumbnailUrl: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                thumbnailUrl: string | null;
                title: string;
                description: string | null;
                subjectId: string;
                price: number;
                order: number;
                isPublished: boolean;
            };
        } & {
            id: string;
            lessonId: string;
            userId: string;
            expiresAt: Date | null;
            enrolledAt: Date;
            paymentId: string | null;
        })[];
    }>;
    getAllGrades(): Promise<({
        _count: {
            subjects: number;
        };
    } & {
        number: number;
        id: string;
        name: string;
        createdAt: Date;
    })[]>;
    createGrade(body: {
        number: number;
        name: string;
    }): Promise<{
        number: number;
        id: string;
        name: string;
        createdAt: Date;
    }>;
    updateGrade(id: string, body: {
        number: number;
        name: string;
    }): Promise<{
        number: number;
        id: string;
        name: string;
        createdAt: Date;
    }>;
    deleteGrade(id: string): Promise<{
        number: number;
        id: string;
        name: string;
        createdAt: Date;
    }>;
    getAllSubjects(): Promise<({
        grade: {
            number: number;
            id: string;
            name: string;
            createdAt: Date;
        };
        _count: {
            lessons: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        gradeId: string;
        thumbnailUrl: string | null;
    })[]>;
    createSubject(body: {
        name: string;
        gradeId: string;
        thumbnailUrl?: string;
    }): Promise<{
        grade: {
            number: number;
            id: string;
            name: string;
            createdAt: Date;
        };
        _count: {
            lessons: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        gradeId: string;
        thumbnailUrl: string | null;
    }>;
    updateSubject(id: string, body: {
        name: string;
        gradeId: string;
        thumbnailUrl?: string;
    }): Promise<{
        grade: {
            number: number;
            id: string;
            name: string;
            createdAt: Date;
        };
        _count: {
            lessons: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        gradeId: string;
        thumbnailUrl: string | null;
    }>;
    deleteSubject(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        gradeId: string;
        thumbnailUrl: string | null;
    }>;
    getAllLessons(): Promise<({
        subject: {
            grade: {
                number: number;
                id: string;
                name: string;
                createdAt: Date;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            gradeId: string;
            thumbnailUrl: string | null;
        };
        _count: {
            videos: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        thumbnailUrl: string | null;
        title: string;
        description: string | null;
        subjectId: string;
        price: number;
        order: number;
        isPublished: boolean;
    })[]>;
    createLesson(body: {
        title: string;
        description: string;
        subjectId: string;
        price: number;
        order: number;
        thumbnailUrl?: string;
    }): Promise<{
        subject: {
            grade: {
                number: number;
                id: string;
                name: string;
                createdAt: Date;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            gradeId: string;
            thumbnailUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        thumbnailUrl: string | null;
        title: string;
        description: string | null;
        subjectId: string;
        price: number;
        order: number;
        isPublished: boolean;
    }>;
    updateLesson(id: string, body: {
        title: string;
        description: string;
        subjectId: string;
        price: number;
        order: number;
        thumbnailUrl?: string;
        isPublished?: boolean;
    }): Promise<{
        subject: {
            grade: {
                number: number;
                id: string;
                name: string;
                createdAt: Date;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            gradeId: string;
            thumbnailUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        thumbnailUrl: string | null;
        title: string;
        description: string | null;
        subjectId: string;
        price: number;
        order: number;
        isPublished: boolean;
    }>;
    deleteLesson(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        thumbnailUrl: string | null;
        title: string;
        description: string | null;
        subjectId: string;
        price: number;
        order: number;
        isPublished: boolean;
    }>;
    getAllVideos(): Promise<({
        lesson: {
            subject: {
                grade: {
                    number: number;
                    id: string;
                    name: string;
                    createdAt: Date;
                };
            } & {
                id: string;
                name: string;
                createdAt: Date;
                gradeId: string;
                thumbnailUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            thumbnailUrl: string | null;
            title: string;
            description: string | null;
            subjectId: string;
            price: number;
            order: number;
            isPublished: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        description: string | null;
        order: number;
        lessonId: string;
        videoUrl: string;
        duration: number;
    })[]>;
    getVideosByLesson(lessonId: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string | null;
        order: number;
        lessonId: string;
        videoUrl: string;
        duration: number;
    }[]>;
    createVideo(body: {
        lessonId: string;
        title: string;
        description: string;
        videoUrl: string;
        duration: number;
        order: number;
    }): Promise<{
        lesson: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            thumbnailUrl: string | null;
            title: string;
            description: string | null;
            subjectId: string;
            price: number;
            order: number;
            isPublished: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        description: string | null;
        order: number;
        lessonId: string;
        videoUrl: string;
        duration: number;
    }>;
    updateVideo(id: string, body: {
        title: string;
        description: string;
        videoUrl: string;
        duration: number;
        order: number;
    }): Promise<{
        lesson: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            thumbnailUrl: string | null;
            title: string;
            description: string | null;
            subjectId: string;
            price: number;
            order: number;
            isPublished: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        description: string | null;
        order: number;
        lessonId: string;
        videoUrl: string;
        duration: number;
    }>;
    deleteVideo(id: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string | null;
        order: number;
        lessonId: string;
        videoUrl: string;
        duration: number;
    }>;
    deleteStudent(id: string): Promise<{
        id: string;
        phoneNumber: string | null;
        email: string;
        googleId: string | null;
        password: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        isVerified: boolean;
        twoFactorSecret: string | null;
        twoFactorEnabled: boolean;
        avatar: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    uploadThumbnail(file: Express.Multer.File): Promise<{
        url: any;
        publicId: any;
    }>;
    getAllStudents(): Promise<({
        enrollments: ({
            lesson: {
                subject: {
                    grade: {
                        number: number;
                        id: string;
                        name: string;
                        createdAt: Date;
                    };
                } & {
                    id: string;
                    name: string;
                    createdAt: Date;
                    gradeId: string;
                    thumbnailUrl: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                thumbnailUrl: string | null;
                title: string;
                description: string | null;
                subjectId: string;
                price: number;
                order: number;
                isPublished: boolean;
            };
        } & {
            id: string;
            lessonId: string;
            userId: string;
            expiresAt: Date | null;
            enrolledAt: Date;
            paymentId: string | null;
        })[];
    } & {
        id: string;
        phoneNumber: string | null;
        email: string;
        googleId: string | null;
        password: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        isVerified: boolean;
        twoFactorSecret: string | null;
        twoFactorEnabled: boolean;
        avatar: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getAllEnrollments(): Promise<({
        user: {
            id: string;
            phoneNumber: string | null;
            name: string;
        };
        lesson: {
            subject: {
                grade: {
                    number: number;
                    id: string;
                    name: string;
                    createdAt: Date;
                };
            } & {
                id: string;
                name: string;
                createdAt: Date;
                gradeId: string;
                thumbnailUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            thumbnailUrl: string | null;
            title: string;
            description: string | null;
            subjectId: string;
            price: number;
            order: number;
            isPublished: boolean;
        };
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            amount: number;
            currency: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            paymentMethod: string | null;
            transactionId: string | null;
            paymentGateway: string;
        } | null;
    } & {
        id: string;
        lessonId: string;
        userId: string;
        expiresAt: Date | null;
        enrolledAt: Date;
        paymentId: string | null;
    })[]>;
}
