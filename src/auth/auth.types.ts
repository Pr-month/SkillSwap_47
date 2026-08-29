import { Request } from 'express';
import { Roles } from '../common/enums/user-role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Roles;
}

export type RefreshAuthUser = JwtPayload & {
  refreshToken: string;
};

export interface AuthRequest extends Request {
  user: JwtPayload;
}
