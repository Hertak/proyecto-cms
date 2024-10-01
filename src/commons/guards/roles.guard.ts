import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (!user.roles || !Array.isArray(user.roles)) {
      throw new ForbiddenException('Roles no encontrados o inválidos');
    }

    const hasRole = () =>
      user.roles.some(
        (role: string) => requiredRoles.includes(role) || role === 'Admin' || (role === 'Profesional' && requiredRoles.includes('Usuario')),
      );

    if (!hasRole()) {
      throw new ForbiddenException('No tienes acceso a este recurso');
    }

    return true;
  }
}
