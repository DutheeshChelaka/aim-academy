import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private readonly isDevelopment: boolean;

  constructor(private configService: ConfigService) {
    this.isDevelopment = this.configService.get<string>('NODE_ENV') !== 'production';

    // Create email transporter
    this.createTransporter();
  }

  private createTransporter() {
    const emailService = this.configService.get<string>('EMAIL_SERVICE') || 'gmail';
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');

    if (!emailUser || !emailPassword) {
      this.logger.warn('⚠️  Email credentials not configured. Emails will be logged to console.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        service: emailService,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });

      this.logger.log(`✅ Email service initialized (${emailService})`);
    } catch (error) {
      this.logger.error('❌ Failed to initialize email service:', error.message);
    }
  }

  /**
   * Send OTP verification email
   */
  async sendOTP(email: string, name: string, otp: string): Promise<boolean> {
    try {
      const subject = 'Verify Your AIM Academy Account';
      const html = this.getOTPEmailTemplate(name, otp);

      return await this.sendEmail(email, subject, html);
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${email}:`, error.message);
      return false;
    }
  }

  /**
   * Send password reset OTP
   */
  async sendPasswordResetOTP(email: string, name: string, otp: string): Promise<boolean> {
    try {
      const subject = 'Reset Your AIM Academy Password';
      const html = this.getPasswordResetTemplate(name, otp);

      return await this.sendEmail(email, subject, html);
    } catch (error) {
      this.logger.error(`Failed to send password reset to ${email}:`, error.message);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      const subject = 'Welcome to AIM Academy! 🎓';
      const html = this.getWelcomeEmailTemplate(name);

      return await this.sendEmail(email, subject, html);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error.message);
      return false;
    }
  }

  /**
   * Core email sending function
   */
  private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    // Development mode - log to console
    if (this.isDevelopment && !this.transporter) {
      this.logger.log(`📧 [DEV MODE] Email to ${to}`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Content: ${html.substring(0, 200)}...`);
      return true;
    }

    // Production mode - send real email
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: `"AIM Academy" <${this.configService.get<string>('EMAIL_USER')}>`,
          to,
          subject,
          html,
        });

        this.logger.log(`✅ Email sent to ${to}. Message ID: ${info.messageId}`);
        return true;
      } catch (error) {
        this.logger.error(`❌ Failed to send email to ${to}:`, error.message);
        return false;
      }
    }

    return false;
  }

  /**
   * OTP Email Template
   */
  private getOTPEmailTemplate(name: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
          .otp-code { font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 8px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 AIM Academy</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for registering with AIM Academy. Please verify your email address to complete your registration.</p>
            
            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Your Verification Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">Valid for 10 minutes</p>
            </div>

            <p><strong>Important:</strong></p>
            <ul>
              <li>Do not share this code with anyone</li>
              <li>AIM Academy will never ask for this code</li>
              <li>This code expires in 10 minutes</li>
            </ul>

            <p>If you didn't create an account with AIM Academy, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AIM Academy. All rights reserved.</p>
            <p>Sri Lanka's Leading Online Learning Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Password Reset Template
   */
  private getPasswordResetTemplate(name: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
          .otp-code { font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 8px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>We received a request to reset your AIM Academy password. Use the code below to reset your password:</p>
            
            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Your Reset Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">Valid for 10 minutes</p>
            </div>

            <p><strong>Security Notice:</strong></p>
            <ul>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request a password reset, please ignore this email</li>
              <li>Your password will not change unless you use this code</li>
            </ul>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AIM Academy. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Welcome Email Template
   */
  private getWelcomeEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to AIM Academy!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Your account has been successfully verified. Welcome to Sri Lanka's leading online learning platform!</p>
            
            <h3>What's Next?</h3>
            <ul>
              <li>📚 Explore our extensive library of lessons</li>
              <li>🎥 Watch high-quality video content</li>
              <li>📊 Track your learning progress</li>
              <li>🏆 Achieve your educational goals</li>
            </ul>

            <p style="text-align: center;">
              <a href="http://localhost:3001/dashboard" class="button">Start Learning Now</a>
            </p>

            <p>If you have any questions, feel free to reach out to our support team.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AIM Academy. All rights reserved.</p>
            <p>Sri Lanka's Leading Online Learning Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get email service status
   */
  getStatus(): { available: boolean; mode: string } {
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
}