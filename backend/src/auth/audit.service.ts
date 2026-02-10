import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log admin action
   */
  async log(
    userId: string,
    action: string,
    details: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      // ✅ FIX: Skip database logging if userId is 'unknown'
      if (userId === 'unknown') {
        console.log(`🔍 Audit (User Not Found): ${action}`, {
          action,
          details,
          ipAddress: ipAddress || 'unknown',
          userAgent: userAgent || 'unknown',
          timestamp: new Date().toISOString(),
        });
        return; // Exit early - don't try to save to database
      }

      // Normal audit logging for valid users
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          details: JSON.stringify(details),
          ipAddress: ipAddress || 'unknown',
          userAgent: userAgent || 'unknown',
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - logging failure shouldn't break the app
    }
  }

  /**
   * Get audit logs for a user
   */
  async getUserLogs(userId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            phoneNumber: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Get all audit logs (admin only)
   */
  async getAllLogs(limit = 100) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            phoneNumber: true,
            role: true,
          },
        },
      },
    });
  }
}