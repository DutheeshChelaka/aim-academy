import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(userId: string, action: string, details: any, ipAddress?: string, userAgent?: string): Promise<void>;
    getUserLogs(userId: string, limit?: number): Promise<({
        user: {
            phoneNumber: string | null;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        action: string;
        details: string;
        ipAddress: string | null;
        userAgent: string | null;
        userId: string;
    })[]>;
    getAllLogs(limit?: number): Promise<({
        user: {
            phoneNumber: string | null;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        action: string;
        details: string;
        ipAddress: string | null;
        userAgent: string | null;
        userId: string;
    })[]>;
}
