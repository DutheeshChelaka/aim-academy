import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private prisma: PrismaService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const email = profile.emails?.[0]?.value;

    if (!email) throw new Error('No email from Google');

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: profile.displayName,
          phoneNumber: `google_${profile.id}`,
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
}