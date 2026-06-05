import { PrismaService } from '../prisma/prisma.service';
export declare class SubjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
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
    findOne(id: string): Promise<({
        grade: {
            number: number;
            id: string;
            name: string;
            createdAt: Date;
        };
        lessons: {
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
        }[];
        _count: {
            lessons: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        gradeId: string;
        thumbnailUrl: string | null;
    }) | null>;
    getLessons(id: string): Promise<({
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
}
