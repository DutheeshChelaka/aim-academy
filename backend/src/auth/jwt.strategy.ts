import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    // Fetch user with role from database
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, phoneNumber: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // ✅ CHANGE: Return 'sub' instead of 'userId'
    return {
      sub: user.id,           // ✅ Changed from userId to sub
      phoneNumber: user.phoneNumber,
      role: user.role,
    };
  }
}