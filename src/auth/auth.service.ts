import { UserService } from '@/users/users.service';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-auth.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import { RolesService } from '@/roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private readonly configService: ConfigService,
    private readonly roleService: RolesService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = await this.userService.create({
        ...createUserDto,
        password: hashedPassword,
      });

      const roleName = createUserDto.role ? createUserDto.role : 'Usuario';

      const role = await this.roleService.findRoleByName(roleName);

      if (!role) {
        throw new BadRequestException(`El rol ${roleName} no existe`);
      }

      await this.roleService.assignRoleToUser(user.id, role.id);

      const updatedUser = await this.userService.findById(user.id, {
        relations: ['userRoles', 'userRoles.role'],
      });

      const roles = updatedUser.userRoles.map((userRole) => userRole.role.name);

      const payload = { username: updatedUser.username, sub: updatedUser.id, roles };

      const secret = this.configService.get<string>('JWT_SECRET_KEY');
      const access_token = this.jwtService.sign(payload, { secret, expiresIn: '60m' });
      const refresh_token = this.jwtService.sign({ sub: user.id }, { secret, expiresIn: '7d' });

      return {
        access_token,
        refresh_token,
        user,
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Usuario o email ya está en uso');
      }
      throw error;
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { username, password } = loginUserDto;
    const user = await this.userService.findByUsername(username, {
      relations: ['userRoles', 'userRoles.role'],
    });

    if (user && bcrypt.compareSync(password, user.password)) {
      const roles = user.userRoles.map((userRole) => userRole.role.name);

      const payload = {
        username: user.username,
        sub: user.id,
        roles,
      };

      const secret = this.configService.get<string>('JWT_SECRET_KEY');

      const access_token = this.jwtService.sign(payload, {
        secret,
        expiresIn: '365d',
      });

      const refresh_token = this.jwtService.sign(
        { sub: user.id, roles },
        {
          secret,
          expiresIn: '7d',
        },
      );

      return {
        access_token,
        refresh_token,
        user,
      };
    }

    return null;
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET_KEY'),
      });

      const user = await this.userService.findById(payload.sub, {
        relations: ['userRoles', 'userRoles.role'],
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const roles = user.userRoles.map((userRole) => userRole.role.name);

      const newAccessToken = this.jwtService.sign(
        {
          username: user.username,
          sub: user.id,
          roles,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET_KEY'),
          expiresIn: '365d',
        },
      );

      return { access_token: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async verifyJwtToken(token: string): Promise<any> {
    try {
      const secret = this.configService.get<string>('JWT_SECRET_KEY');
      const payload = await this.jwtService.verifyAsync(token, { secret });

      return payload;
    } catch (error) {
      console.log('Error verificando el token:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validate(payload: any) {
    if (!payload.sub || isNaN(payload.sub)) {
      console.error('Error: Payload inválido o userId inválido:', payload.sub);
      throw new UnauthorizedException('Invalid userId in token');
    }

    const user = await this.userService.findById(payload.sub, {
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      console.error('Usuario no encontrado con ID:', payload.sub);
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }
}
