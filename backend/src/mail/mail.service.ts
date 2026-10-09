import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

export type SendUserNotificationPayload = {
  subject: string;
  text: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendUserNotification(
    email: string,
    payload: SendUserNotificationPayload,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: payload.subject,
        text: payload.text,
      });
    } catch (error) {
      this.logger.error(
        `Не удалось отправить письмо на ${email}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
