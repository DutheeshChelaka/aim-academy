import { AuthService } from './auth.service';
import { Enable2FADto, Verify2FADto } from './dto/two-factor.dto';
import type { Response } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: {
        email: string;
        phoneNumber: string;
        password: string;
        name: string;
    }): Promise<{
        otp?: string | undefined;
        message: string;
        email: string;
    }>;
    verifyOTP(body: {
        email: string;
        code: string;
    }): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            phoneNumber: string | null;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    login(body: {
        identifier: string;
        password: string;
    }, ip: string, userAgent: string): Promise<{
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
    resendOTP(body: {
        email: string;
    }): Promise<{
        otp?: string | undefined;
        message: string;
    }>;
    googleAuth(callback: string, res: Response): Promise<void>;
    googleAuthRedirect(req: any, res: Response, state: string): Promise<void>;
    verify2FA(body: Verify2FADto, ip: string, userAgent: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            phoneNumber: string | null;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    adminLogin(body: {
        phoneNumber: string;
        password: string;
    }, ip: string, userAgent: string): Promise<{
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
    verifyAdmin2FA(body: Verify2FADto, ip: string, userAgent: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            phoneNumber: string | null;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    setup2FA(req: any): Promise<{
        secret: string;
        qrCode: string;
        message: string;
    }>;
    enable2FA(req: any, body: Enable2FADto): Promise<{
        message: string;
        enabled: boolean;
    }>;
    disable2FA(req: any, body: {
        password: string;
        totpCode: string;
    }): Promise<{
        message: string;
        enabled: boolean;
    }>;
    get2FAStatus(req: any): Promise<{
        enabled: boolean;
    }>;
    forgotPassword(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(body: {
        token: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    validateResetToken(token: string): Promise<{
        valid: boolean;
    }>;
}
