import { Strategy, Profile } from 'passport-google-oauth20';
import { PrismaService } from '../prisma/prisma.service';
declare const GoogleStrategy_base: new (...args: [options: import("passport-google-oauth20").StrategyOptionsWithRequest] | [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class GoogleStrategy extends GoogleStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(accessToken: string, refreshToken: string, profile: Profile): Promise<{
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
}
export {};
