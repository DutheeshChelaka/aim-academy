import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { TwoFactorService } from './two-factor.service';
import { AuditService } from './audit.service';
import { EmailService } from '../email/email.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private twoFactorService;
    private auditService;
    private emailService;
    constructor(prisma: PrismaService, jwtService: JwtService, twoFactorService: TwoFactorService, auditService: AuditService, emailService: EmailService);
    register(email: string, phoneNumber: string, password: string, name: string): Promise<{
        otp?: string | undefined;
        message: string;
        email: string;
    }>;
    verifyOTP(email: string, code: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            phoneNumber: string | null;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    login(identifier: string, password: string, ipAddress?: string, userAgent?: string): Promise<{
        requiresTwoFactor: boolean;
        tempToken: string;
        message: string;
        accessToken?: undefined;
        user?: undefined;
    } | {
        accessToken: string;
        user: {
            id: string;
            email: string;
            phoneNumber: string | null;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
        requiresTwoFactor?: undefined;
        tempToken?: undefined;
        message?: undefined;
    }>;
    resendOTP(email: string): Promise<{
        otp?: string | undefined;
        message: string;
    }>;
    adminLogin(phoneNumber: string, password: string, ipAddress?: string, userAgent?: string): Promise<{
        requiresTwoFactor: boolean;
        tempToken: string;
        message: string;
        accessToken?: undefined;
        user?: undefined;
    } | {
        accessToken: string;
        user: {
            id: string;
            email: string;
            phoneNumber: string | null;
            name: string;
            role: "ADMIN";
        };
        requiresTwoFactor?: undefined;
        tempToken?: undefined;
        message?: undefined;
    }>;
    verify2FA(tempToken: string, totpCode: string, ipAddress?: string, userAgent?: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            phoneNumber: string | null;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    verifyAdmin2FA(tempToken: string, totpCode: string, ipAddress?: string, userAgent?: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            phoneNumber: string | null;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    setup2FA(userId: string): Promise<{
        secret: string;
        qrCode: string;
        message: string;
    }>;
    enable2FA(userId: string, token: string): Promise<{
        message: string;
        enabled: boolean;
    }>;
    disable2FA(userId: string, password: string, totpCode: string): Promise<{
        message: string;
        enabled: boolean;
    }>;
    findUserById(userId: string): Promise<{
        id: string;
        email: string;
        phoneNumber: string | null;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        twoFactorEnabled: boolean;
    } | null>;
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    validateResetToken(token: string): Promise<{
        valid: boolean;
    }>;
    generateToken(userId: string): string;
}
