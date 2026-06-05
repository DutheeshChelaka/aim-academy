import { GradesService } from './grades.service';
export declare class GradesController {
    private readonly gradesService;
    constructor(gradesService: GradesService);
    findAll(): Promise<({
        _count: {
            subjects: number;
        };
    } & {
        number: number;
        id: string;
        name: string;
        createdAt: Date;
    })[]>;
    findOne(id: string): Promise<({
        subjects: {
            id: string;
            name: string;
            createdAt: Date;
            gradeId: string;
            thumbnailUrl: string | null;
        }[];
        _count: {
            subjects: number;
        };
    } & {
        number: number;
        id: string;
        name: string;
        createdAt: Date;
    }) | null>;
    getSubjects(id: string): Promise<({
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
}
