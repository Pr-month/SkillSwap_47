import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigType, registerAs } from '@nestjs/config';

export const mailConfig = registerAs('MAIL_CONFIG', (): MailerOptions => {
  const port = Number(process.env.MAIL_PORT) || 465;

  return {
    transport: {
      host: process.env.MAIL_HOST || 'smtp.example.com',
      port,
      secure:
        process.env.MAIL_SECURE !== undefined
          ? process.env.MAIL_SECURE === 'true'
          : port === 465,
      auth: {
        user: process.env.MAIL_USER || '',
        pass: process.env.MAIL_PASSWORD || '',
      },
    },
    defaults: {
      from: process.env.MAIL_FROM || '"No Reply" <noreply@example.com>',
    },
  };
});

export type IMailConfig = ConfigType<typeof mailConfig>;
