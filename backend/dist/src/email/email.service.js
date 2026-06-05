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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = EmailService_1 = class EmailService {
    configService;
    logger = new common_1.Logger(EmailService_1.name);
    isDevelopment;
    transporter;
    smtpUser;
    constructor(configService) {
        this.configService = configService;
        this.isDevelopment = this.configService.get('NODE_ENV') !== 'production';
        this.smtpUser = this.configService.get('EMAIL_USER') || '';
        this.initializeTransporter();
    }
    initializeTransporter() {
        const emailUser = this.configService.get('EMAIL_USER');
        const emailPassword = this.configService.get('EMAIL_PASSWORD');
        const smtpHost = this.configService.get('SMTP_HOST') || 'smtp.gmail.com';
        const smtpPort = parseInt(this.configService.get('SMTP_PORT') || '587');
        const smtpSecure = this.configService.get('SMTP_SECURE') === 'true';
        if (!emailUser || !emailPassword) {
            this.logger.warn('⚠️  Email credentials not configured. Emails will be logged to console.');
            return;
        }
        try {
            this.transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpSecure,
                auth: {
                    user: emailUser,
                    pass: emailPassword,
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            this.logger.log(`✅ Email service initialized: ${emailUser} via ${smtpHost}:${smtpPort}`);
        }
        catch (error) {
            this.logger.error('❌ Failed to initialize email transporter:', error.message);
        }
    }
    async sendOTP(email, name, otp) {
        try {
            const subject = 'Your AIM Academy Verification Code';
            const text = `Hi ${name},\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nThank you,\nAIM Academy Team`;
            const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">AIM Academy</h2>
          <p>Hi ${name},</p>
          <p>Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="margin: 0; letter-spacing: 5px; color: #dc2626;">${otp}</h1>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Thank you,<br><strong>AIM Academy Team</strong></p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} AIM Academy | Sri Lanka's Leading Online Learning Platform
          </p>
        </div>
      `;
            return await this.sendEmail(email, subject, text, html);
        }
        catch (error) {
            this.logger.error(`Failed to send OTP to ${email}:`, error.message);
            return false;
        }
    }
    async sendPasswordResetEmail(email, name, resetLink) {
        try {
            const subject = 'Reset Your AIM Academy Password';
            const text = `Hi ${name},\n\nWe received a request to reset your password.\n\nClick here to reset: ${resetLink}\n\nThis link expires in 1 hour and can only be used once.\n\nIf you didn't request this, please ignore this email.\n\nThank you,\nAIM Academy Team`;
            const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">Reset Your Password</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password for your AIM Academy account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link:</p>
          <p style="background: #f3f4f6; padding: 10px; word-break: break-all; font-size: 12px;">${resetLink}</p>
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>Important:</strong></p>
            <ul style="margin: 10px 0; font-size: 14px;">
              <li>This link expires in 1 hour</li>
              <li>Can only be used once</li>
              <li>Ignore if you didn't request this</li>
            </ul>
          </div>
          <p>Thank you,<br><strong>AIM Academy Team</strong></p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} AIM Academy
          </p>
        </div>
      `;
            return await this.sendEmail(email, subject, text, html);
        }
        catch (error) {
            this.logger.error(`Failed to send password reset to ${email}:`, error.message);
            return false;
        }
    }
    async sendWelcomeEmail(email, name) {
        try {
            const frontendUrl = this.configService.get('FRONTEND_URL') || 'https://aimacademy.lk';
            const subject = 'Welcome to AIM Academy!';
            const text = `Hi ${name}!\n\nWelcome to AIM Academy! Your account has been successfully verified.\n\nStart learning now: ${frontendUrl}/dashboard\n\nThank you,\nAIM Academy Team`;
            const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">Welcome to AIM Academy! 🎉</h2>
          <p>Hi ${name}!</p>
          <p>Your account has been successfully verified. Welcome to Sri Lanka's leading online learning platform!</p>
          <h3>What's Next?</h3>
          <ul>
            <li>📚 Explore our extensive library of lessons</li>
            <li>🎥 Watch high-quality video content</li>
            <li>📊 Track your learning progress</li>
            <li>🏆 Achieve your educational goals</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${frontendUrl}/dashboard" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Start Learning Now</a>
          </div>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Thank you,<br><strong>AIM Academy Team</strong></p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} AIM Academy | Sri Lanka's Leading Online Learning Platform
          </p>
        </div>
      `;
            return await this.sendEmail(email, subject, text, html);
        }
        catch (error) {
            this.logger.error(`Failed to send welcome email to ${email}:`, error.message);
            return false;
        }
    }
    async sendEmail(to, subject, text, html) {
        if (this.isDevelopment && !this.transporter) {
            this.logger.log(`📧 [DEV MODE] Email to ${to}`);
            this.logger.log(`Subject: ${subject}`);
            this.logger.log(`Content: ${text.substring(0, 200)}...`);
            return true;
        }
        if (this.transporter) {
            try {
                const mailOptions = {
                    from: `"AIM Academy" <${this.smtpUser}>`,
                    to,
                    subject,
                    text,
                    html,
                };
                await this.transporter.sendMail(mailOptions);
                this.logger.log(`✅ Email sent to ${to} via ${this.smtpUser}`);
                return true;
            }
            catch (error) {
                this.logger.error(`❌ Failed to send email to ${to}:`, error.message);
                return false;
            }
        }
        this.logger.warn(`⚠️  Email not sent - transporter not configured`);
        return false;
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    getStatus() {
        if (this.transporter) {
            return {
                available: true,
                mode: this.isDevelopment ? 'development' : 'production',
            };
        }
        return {
            available: false,
            mode: 'console-only',
        };
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map