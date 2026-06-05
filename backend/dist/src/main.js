"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const passport = require("passport");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        rawBody: true,
    });
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://aim-academy-two.vercel.app',
            'https://aimacademy.lk',
            'https://www.aimacademy.lk',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const adminLoginLimiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 5,
        message: 'Too many login attempts. Please try again in 15 minutes.',
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/auth/admin/login', adminLoginLimiter);
    app.use('/auth/admin/verify-2fa', adminLoginLimiter);
    app.use(passport.initialize());
    const port = process.env.PORT ?? 8080;
    await app.listen(port);
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`🔐 Admin 2FA endpoints available at /auth/admin/*`);
    console.log(`🔑 Google OAuth available at /auth/google`);
}
bootstrap();
//# sourceMappingURL=main.js.map