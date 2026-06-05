"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const passport_1 = require("@nestjs/passport");
const two_factor_dto_1 = require("./dto/two-factor.dto");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    register(body) {
        return this.authService.register(body.email, body.phoneNumber, body.password, body.name);
    }
    verifyOTP(body) {
        return this.authService.verifyOTP(body.email, body.code);
    }
    async login(body, ip, userAgent) {
        return this.authService.login(body.identifier, body.password, ip, userAgent);
    }
    resendOTP(body) {
        return this.authService.resendOTP(body.email);
    }
    async googleAuth(callback, res) {
        const state = callback ? encodeURIComponent(callback) : '';
        const redirectUri = `${process.env.BACKEND_URL}/auth/google/callback`;
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth` +
            `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent('email profile')}` +
            `&access_type=offline` +
            (state ? `&state=${state}` : '');
        return res.redirect(googleAuthUrl);
    }
    async googleAuthRedirect(req, res, state) {
        const user = req.user;
        const token = this.authService.generateToken(user.id);
        const callbackUrl = state ? decodeURIComponent(state) : `${process.env.FRONTEND_URL}/auth/callback`;
        const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            phoneNumber: user.phoneNumber,
            role: user.role,
            avatar: user.avatar,
        };
        const frontendUrl = `${callbackUrl}?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
        return res.redirect(frontendUrl);
    }
    async verify2FA(body, ip, userAgent) {
        return this.authService.verify2FA(body.tempToken, body.totpCode, ip, userAgent);
    }
    async adminLogin(body, ip, userAgent) {
        return this.authService.adminLogin(body.phoneNumber, body.password, ip, userAgent);
    }
    async verifyAdmin2FA(body, ip, userAgent) {
        return this.authService.verifyAdmin2FA(body.tempToken, body.totpCode, ip, userAgent);
    }
    async setup2FA(req) {
        return this.authService.setup2FA(req.user.userId);
    }
    async enable2FA(req, body) {
        return this.authService.enable2FA(req.user.userId, body.token);
    }
    async disable2FA(req, body) {
        return this.authService.disable2FA(req.user.userId, body.password, body.totpCode);
    }
    async get2FAStatus(req) {
        const user = await this.authService.findUserById(req.user.userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return {
            enabled: user.twoFactorEnabled,
        };
    }
    async forgotPassword(body) {
        if (!body.email) {
            throw new common_1.BadRequestException('Email is required');
        }
        return this.authService.requestPasswordReset(body.email);
    }
    async resetPassword(body) {
        if (!body.token || !body.newPassword) {
            throw new common_1.BadRequestException('Token and new password are required');
        }
        if (body.newPassword.length < 6) {
            throw new common_1.BadRequestException('Password must be at least 6 characters');
        }
        return this.authService.resetPassword(body.token, body.newPassword);
    }
    async validateResetToken(token) {
        if (!token) {
            throw new common_1.BadRequestException('Token is required');
        }
        return this.authService.validateResetToken(token);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyOTP", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('resend-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resendOTP", null);
__decorate([
    (0, common_1.Get)('google'),
    __param(0, (0, common_1.Query)('callback')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('state')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuthRedirect", null);
__decorate([
    (0, common_1.Post)('verify-2fa'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [two_factor_dto_1.Verify2FADto, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify2FA", null);
__decorate([
    (0, common_1.Post)('admin/login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminLogin", null);
__decorate([
    (0, common_1.Post)('admin/verify-2fa'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [two_factor_dto_1.Verify2FADto, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyAdmin2FA", null);
__decorate([
    (0, common_1.Post)('admin/setup-2fa'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "setup2FA", null);
__decorate([
    (0, common_1.Post)('admin/enable-2fa'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, two_factor_dto_1.Enable2FADto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "enable2FA", null);
__decorate([
    (0, common_1.Post)('admin/disable-2fa'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "disable2FA", null);
__decorate([
    (0, common_1.Get)('admin/2fa-status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "get2FAStatus", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Get)('validate-reset-token'),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateResetToken", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map