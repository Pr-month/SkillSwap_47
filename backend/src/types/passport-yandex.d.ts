declare module 'passport-yandex' {
  import { Strategy as PassportStrategy } from 'passport-strategy';

  export interface Profile {
    id: string;
    displayName?: string;
    emails?: Array<{ value: string }>;
    photos?: Array<{ value: string }>;
    provider: string;
    _json?: Record<string, unknown>;
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  }

  export class Strategy extends PassportStrategy {
    constructor(
      options: StrategyOptions,
      verify?: (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (error: Error | null, user?: unknown) => void,
      ) => void,
    );
    name: string;
  }
}
