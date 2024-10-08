import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '@/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesModule } from '@/roles/roles.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { NotificationService } from '@/notification/notification.service';
import { UserNotificationService } from '@/notification/user-notification.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 50,
      },
    ]),
    forwardRef(() => UsersModule),
    RolesModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '365d' },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    NotificationService,
    UserNotificationService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
