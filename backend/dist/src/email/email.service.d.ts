import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private readonly logger;
    private readonly isDevelopment;
    private transporter;
    private smtpUser;
    constructor(configService: ConfigService);
    private initializeTransporter;
    sendOTP(email: string, name: string, otp: string): Promise<boolean>;
    sendPasswordResetEmail(email: string, name: string, resetLink: string): Promise<boolean>;
    sendWelcomeEmail(email: string, name: string): Promise<boolean>;
    sendEmail(to: string, subject: string, text: string, html: string): Promise<boolean>;
    isValidEmail(email: string): boolean;
    getStatus(): {
        available: boolean;
        mode: string;
    };
}
