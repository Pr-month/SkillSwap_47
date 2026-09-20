export class OAuthUserDto {
  provider!: 'yandex' | 'google' | 'github';
  providerId!: string;
  email?: string;
  name?: string;
  avatar?: string;
}
