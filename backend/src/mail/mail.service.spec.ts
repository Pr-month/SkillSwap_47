import { Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;
  let sendMail: jest.Mock;
  let loggerError: jest.SpyInstance;

  beforeEach(async () => {
    sendMail = jest.fn().mockResolvedValue(undefined);
    loggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailerService, useValue: { sendMail } },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('sendUserNotification sends mail with to, subject and text', async () => {
    await service.sendUserNotification('user@mail.com', {
      subject: 'Тема',
      text: 'Текст письма',
    });

    expect(sendMail).toHaveBeenCalledWith({
      to: 'user@mail.com',
      subject: 'Тема',
      text: 'Текст письма',
    });
  });

  it('sendUserNotification logs and does not throw on SMTP error', async () => {
    sendMail.mockRejectedValue(new Error('smtp down'));

    await expect(
      service.sendUserNotification('user@mail.com', {
        subject: 'Тема',
        text: 'Текст',
      }),
    ).resolves.toBeUndefined();

    expect(loggerError).toHaveBeenCalled();
  });
});
