import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UsersService } from 'src/modules/user-modules/users/users.service';
import { ROLE_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../types/jwt.type';

type RequestWithUser = Request & { user: JwtPayload };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();

    const userExist = await this.usersService.findOne(user.sub);

    const role = userExist?.role;
    if (!role) {
      return false;
    }

    return requiredRoles.includes(role);
  }
}
