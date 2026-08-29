import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (key: 'sub' | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: { sub: string } }>();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    return key ? user[key] : user;
  },
);
