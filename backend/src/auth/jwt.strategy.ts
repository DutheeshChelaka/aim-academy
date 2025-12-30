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
      secretOrKey: 'your-secret-key',
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

    return {
      userId: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };
  }
}