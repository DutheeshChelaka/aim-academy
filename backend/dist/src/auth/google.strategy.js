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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const prisma_service_1 = require("../prisma/prisma.service");
let GoogleStrategy = class GoogleStrategy extends (0, passport_1.PassportStrategy)(passport_google_oauth20_1.Strategy, 'google') {
    prisma;
    constructor(prisma) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
            scope: ['email', 'profile'],
        });
        this.prisma = prisma;
    }
    async validate(accessToken, refreshToken, profile) {
        const email = profile.emails?.[0]?.value;
        if (!email)
            throw new Error('No email from Google');
        let user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email,
                    name: profile.displayName,
                    phoneNumber: '',
                    password: '',
                    isVerified: true,
                    googleId: profile.id,
                    avatar: profile.photos?.[0]?.value,
                },
            });
        }
        if (!user.googleId) {
            user = await this.prisma.user.update({
                where: { email },
                data: {
                    googleId: profile.id,
                    avatar: profile.photos?.[0]?.value || user.avatar,
                },
            });
        }
        return user;
    }
};
exports.GoogleStrategy = GoogleStrategy;
exports.GoogleStrategy = GoogleStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GoogleStrategy);
//# sourceMappingURL=google.strategy.js.map