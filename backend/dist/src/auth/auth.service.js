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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const two_factor_service_1 = require("./two-factor.service");
const audit_service_1 = require("./audit.service");
const email_service_1 = require("../email/email.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    twoFactorService;
    auditService;
    emailService;
    constructor(prisma, jwtService, twoFactorService, auditService, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.twoFactorService = twoFactorService;
        this.auditService = auditService;
        this.emailService = emailService;
    }
    async register(email, phoneNumber, password, name) {
        if (!this.emailService.isValidEmail(email)) {
            throw new common_1.BadRequestException('Invalid email format');
        }
        const existingEmail = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingEmail) {
            throw new common_1.BadRequestException('Email already registered');
        }
        const existingPhone = await this.prisma.user.findUnique({
            where: { phoneNumber },
        });
        if (existingPhone) {
            throw new common_1.BadRequestException('Phone number already registered');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                phoneNumber,
                password: hashedPassword,
                name,
                isVerified: false,
            },
        });
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.prisma.oTP.create({
            data: {
                userId: user.id,
                code: otpCode,
                type: 'REGISTRATION',
                expiresAt,
                isUsed: false,
            },
        });
        const emailSent = await this.emailService.sendOTP(email, name, otpCode);
        if (!emailSent) {
            console.warn('Failed to send email, but user registered. OTP:', otpCode);
        }
        return {
            message: 'Registration successful. Please check your email for OTP.',
            email: user.email,
            ...(process.env.NODE_ENV !== 'production' && { otp: otpCode }),
        };
    }
    async verifyOTP(email, code) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const otp = await this.prisma.oTP.findFirst({
            where: {
                userId: user.id,
                code,
                type: 'REGISTRATION',
                isUsed: false,
                expiresAt: {
                    gte: new Date(),
                },
            },
        });
        if (!otp) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        await this.prisma.oTP.update({
            where: { id: otp.id },
            data: { isUsed: true },
        });
        await this.prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true },
        });
        await this.emailService.sendWelcomeEmail(user.email, user.name);
        const payload = { sub: user.id, email: user.email, phoneNumber: user.phoneNumber, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                name: user.name,
                role: user.role,
            },
        };
    }
    async login(identifier, password, ipAddress, userAgent) {
        console.log('🔍 Login attempt:', {
            identifier,
            passwordProvided: password,
            passwordLength: password.length,
        });
        const user = await this.prisma.user.findUnique({
            where: { email: identifier },
        });
        console.log('👤 User found:', user ? {
            id: user.id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            isVerified: user.isVerified,
            hasPassword: !!user.password,
            passwordHashPreview: user.password.substring(0, 30) + '...',
        } : 'null');
        if (!user) {
            console.log('❌ User not found');
            if (ipAddress) {
                try {
                    await this.auditService.log('unknown', 'LOGIN_FAILED', { identifier, reason: 'User not found' }, ipAddress, userAgent);
                }
                catch (error) {
                    console.error('Failed to log audit:', error);
                }
            }
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isVerified && user.role !== 'ADMIN') {
            console.log('❌ User not verified');
            throw new common_1.UnauthorizedException('Please verify your email first');
        }
        console.log('🔐 Comparing password...');
        console.log('Password from request:', password);
        console.log('Hash from database:', user.password);
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('✅ Password comparison result:', isPasswordValid);
        if (!isPasswordValid) {
            console.log('❌ Password invalid');
            if (ipAddress) {
                try {
                    await this.auditService.log(user.id, 'LOGIN_FAILED', { reason: 'Invalid password' }, ipAddress, userAgent);
                }
                catch (error) {
                    console.error('Failed to log audit:', error);
                }
            }
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.twoFactorEnabled && user.twoFactorSecret) {
            console.log('🔐 2FA enabled, sending temp token');
            const tempToken = this.jwtService.sign({ sub: user.id, type: 'temp' }, { expiresIn: '5m' });
            return {
                requiresTwoFactor: true,
                tempToken,
                message: 'Please enter your 2FA code',
            };
        }
        console.log('✅ Login successful, generating token');
        const payload = { sub: user.id, email: user.email, phoneNumber: user.phoneNumber, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        if (ipAddress) {
            try {
                await this.auditService.log(user.id, 'LOGIN_SUCCESS', { twoFactorUsed: false }, ipAddress, userAgent);
            }
            catch (error) {
                console.error('Failed to log audit:', error);
            }
        }
        console.log('🎉 Login complete!');
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                name: user.name,
                role: user.role,
            },
        };
    }
    async resendOTP(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (user.isVerified) {
            throw new common_1.BadRequestException('User already verified');
        }
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.prisma.oTP.create({
            data: {
                userId: user.id,
                code: otpCode,
                type: 'REGISTRATION',
                expiresAt,
                isUsed: false,
            },
        });
        const emailSent = await this.emailService.sendOTP(user.email, user.name, otpCode);
        if (!emailSent) {
            console.warn('Failed to send email. OTP:', otpCode);
        }
        return {
            message: 'OTP sent to your email successfully',
            ...(process.env.NODE_ENV !== 'production' && { otp: otpCode }),
        };
    }
    async adminLogin(phoneNumber, password, ipAddress, userAgent) {
        const user = await this.prisma.user.findUnique({
            where: { phoneNumber },
        });
        if (!user || user.role !== 'ADMIN') {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            await this.auditService.log(user.id, 'ADMIN_LOGIN_FAILED', { reason: 'Invalid password' }, ipAddress, userAgent);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.twoFactorEnabled) {
            const tempToken = this.jwtService.sign({ sub: user.id, type: 'temp' }, { expiresIn: '5m' });
            return {
                requiresTwoFactor: true,
                tempToken,
                message: 'Please enter your 2FA code',
            };
        }
        await this.auditService.log(user.id, 'ADMIN_LOGIN_SUCCESS', { twoFactorUsed: false }, ipAddress, userAgent);
        const accessToken = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
        });
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                name: user.name,
                role: user.role,
            },
        };
    }
    async verify2FA(tempToken, totpCode, ipAddress, userAgent) {
        let decoded;
        try {
            decoded = this.jwtService.verify(tempToken);
            if (decoded.type !== 'temp') {
                throw new Error('Invalid token type');
            }
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid or expired temporary token');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: decoded.sub },
        });
        if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
            throw new common_1.UnauthorizedException('2FA not configured');
        }
        const isValid = this.twoFactorService.verifyToken(totpCode, user.twoFactorSecret);
        if (!isValid) {
            const action = user.role === 'ADMIN' ? 'ADMIN_2FA_FAILED' : '2FA_FAILED';
            await this.auditService.log(user.id, action, { reason: 'Invalid TOTP code' }, ipAddress, userAgent);
            throw new common_1.UnauthorizedException('Invalid 2FA code');
        }
        const action = user.role === 'ADMIN' ? 'ADMIN_LOGIN_SUCCESS' : 'LOGIN_SUCCESS';
        await this.auditService.log(user.id, action, { twoFactorUsed: true }, ipAddress, userAgent);
        const accessToken = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
        });
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                name: user.name,
                role: user.role,
            },
        };
    }
    async verifyAdmin2FA(tempToken, totpCode, ipAddress, userAgent) {
        return this.verify2FA(tempToken, totpCode, ipAddress, userAgent);
    }
    async setup2FA(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || user.role !== 'ADMIN') {
            throw new common_1.BadRequestException('Only admins can enable 2FA');
        }
        if (user.twoFactorEnabled) {
            throw new common_1.BadRequestException('2FA already enabled');
        }
        const { secret, qrCode } = await this.twoFactorService.generateSecret(user.name);
        await this.prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: secret },
        });
        return {
            secret,
            qrCode,
            message: 'Scan this QR code with Google Authenticator app',
        };
    }
    async enable2FA(userId, token) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.twoFactorSecret) {
            throw new common_1.BadRequestException('2FA not setup. Call setup2FA first');
        }
        if (user.twoFactorEnabled) {
            throw new common_1.BadRequestException('2FA already enabled');
        }
        const isValid = this.twoFactorService.verifyToken(token, user.twoFactorSecret);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid 2FA code');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { twoFactorEnabled: true },
        });
        await this.auditService.log(userId, 'ADMIN_2FA_ENABLED', { success: true });
        return {
            message: '2FA enabled successfully',
            enabled: true,
        };
    }
    async disable2FA(userId, password, totpCode) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid password');
        }
        if (user.twoFactorEnabled && user.twoFactorSecret) {
            const isValid = this.twoFactorService.verifyToken(totpCode, user.twoFactorSecret);
            if (!isValid) {
                throw new common_1.UnauthorizedException('Invalid 2FA code');
            }
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
            },
        });
        await this.auditService.log(userId, 'ADMIN_2FA_DISABLED', { success: true });
        return {
            message: '2FA disabled successfully',
            enabled: false,
        };
    }
    async findUserById(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return null;
        }
        return {
            id: user.id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            name: user.name,
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled || false,
        };
    }
    async requestPasswordReset(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return {
                message: 'If this email is registered, you will receive a password reset link.',
            };
        }
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        await this.prisma.passwordReset.create({
            data: {
                userId: user.id,
                token,
                expiresAt,
                used: false,
            },
        });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await this.emailService.sendPasswordResetEmail(user.email, user.name, resetLink);
        return {
            message: 'If this email is registered, you will receive a password reset link.',
        };
    }
    async resetPassword(token, newPassword) {
        const resetRecord = await this.prisma.passwordReset.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!resetRecord) {
            throw new common_1.UnauthorizedException('Invalid or expired reset token');
        }
        if (resetRecord.used) {
            throw new common_1.UnauthorizedException('This reset link has already been used');
        }
        if (new Date() > resetRecord.expiresAt) {
            throw new common_1.UnauthorizedException('This reset link has expired');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: resetRecord.userId },
                data: { password: hashedPassword },
            }),
            this.prisma.passwordReset.update({
                where: { id: resetRecord.id },
                data: { used: true },
            }),
        ]);
        return {
            message: 'Password reset successful',
        };
    }
    async validateResetToken(token) {
        const resetRecord = await this.prisma.passwordReset.findUnique({
            where: { token },
        });
        if (!resetRecord || resetRecord.used || new Date() > resetRecord.expiresAt) {
            return { valid: false };
        }
        return { valid: true };
    }
    generateToken(userId) {
        const payload = { sub: userId };
        return this.jwtService.sign(payload);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        two_factor_service_1.TwoFactorService,
        audit_service_1.AuditService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map