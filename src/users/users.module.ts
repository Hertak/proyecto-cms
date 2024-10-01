import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from '@/media/entities/media.entity';
import { User } from './entities/user.entity';
import { AuthModule } from '@/auth/auth.module';
import { UserRole } from '@/roles/entities/user-role.entity';
import { RolesModule } from '@/roles/roles.module';
import { MediaModule } from '@/media/media.module';
import { JwtAuthGuard } from '@/commons/guards/auth.guard';
import { RolesGuard } from '@/commons/guards/roles.guard';
import { UserProfileController } from './users-profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Media, User, UserRole]), forwardRef(() => AuthModule), RolesModule, MediaModule],
  controllers: [UserController, UserProfileController],
  providers: [UserService, JwtAuthGuard, RolesGuard],
  exports: [UserService],
})
export class UsersModule {}
