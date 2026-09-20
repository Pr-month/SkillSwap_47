import { Request } from 'express';
import { Roles } from '../common/enums/user-role.enum';
import { OAuthUserDto } from './dto/oauth-user.dto';

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

export interface OAuthRequest extends Request {
  user: OAuthUserDto;
}
