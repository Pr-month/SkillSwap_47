import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

describe('UploadController', () => {
  let controller: UploadController;
  let getPublicUrl: jest.Mock;

  const file = {
    fieldname: 'file',
    originalname: 'avatar.png',
    encoding: '7bit',
    mimetype: 'image/png',
    destination: '/tmp/uploads',
    filename: 'generated-name.png',
    path: '/tmp/uploads/generated-name.png',
    size: 1024,
  } as Express.Multer.File;

  beforeEach(async () => {
    getPublicUrl = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [{ provide: UploadService, useValue: { getPublicUrl } }],
    }).compile();

    controller = module.get<UploadController>(UploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upload', () => {
    it('throws BadRequestException when file is missing', () => {
      expect(() => controller.upload(undefined as never)).toThrow(
        BadRequestException,
      );
      expect(() => controller.upload(undefined as never)).toThrow(
        'Файл не передан',
      );
      expect(getPublicUrl).not.toHaveBeenCalled();
    });

    it('returns public url for uploaded file', () => {
      getPublicUrl.mockReturnValue({ url: '/uploads/generated-name.png' });

      const result = controller.upload(file);

      expect(getPublicUrl).toHaveBeenCalledTimes(1);
      expect(getPublicUrl).toHaveBeenCalledWith('generated-name.png');
      expect(result).toEqual({ url: '/uploads/generated-name.png' });
    });

    it('uses stored filename, not original name', () => {
      getPublicUrl.mockReturnValue({ url: '/uploads/generated-name.png' });

      controller.upload(file);

      expect(getPublicUrl).not.toHaveBeenCalledWith('avatar.png');
    });
  });
});
