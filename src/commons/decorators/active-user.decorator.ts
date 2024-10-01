import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ActiveUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;

  console.log('Mensaje desde decorador ActiveUser:', user);

  if (!user) {
    throw new Error('Decorador No se ha podido extraer el usuario del token JWT');
  }

  return user;
});
