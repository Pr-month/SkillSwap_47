import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import type { DiskStorageOptions } from 'multer';
import { join } from 'path';
import { multerOptions, UPLOAD_DIR } from './multer.options';

// diskStorage возвращает непрозрачный StorageEngine — подменяем его,
// чтобы получить доступ к переданным destination/filename.
jest.mock('multer', () => ({
  diskStorage: jest.fn((options: unknown) => options),
}));

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const makeFile = (
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File =>
  ({
    fieldname: 'file',
    originalname: 'avatar.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 1024,
    ...overrides,
  }) as Express.Multer.File;

const request = {} as Request;

describe('multerOptions', () => {
  const storage = multerOptions.storage as unknown as DiskStorageOptions;

  describe('UPLOAD_DIR', () => {
    it('points to public/uploads inside project root', () => {
      expect(UPLOAD_DIR).toBe(join(process.cwd(), 'public', 'uploads'));
    });
  });

  describe('storage', () => {
    it('stores files into UPLOAD_DIR', () => {
      expect(storage.destination).toBe(UPLOAD_DIR);
    });

    it('generates uuid-based filename preserving extension', () => {
      const cb = jest.fn();

      storage.filename?.(request, makeFile({ originalname: 'photo.JPG' }), cb);

      expect(cb).toHaveBeenCalledTimes(1);
      const [error, filename] = cb.mock.calls[0] as [Error | null, string];
      expect(error).toBeNull();
      expect(filename.endsWith('.JPG')).toBe(true);
      expect(filename.slice(0, -'.JPG'.length)).toMatch(UUID_REGEX);
    });

    it('generates unique filenames for the same original name', () => {
      const first = jest.fn<void, [Error | null, string]>();
      const second = jest.fn<void, [Error | null, string]>();

      storage.filename?.(request, makeFile(), first);
      storage.filename?.(request, makeFile(), second);

      expect(first.mock.calls[0][1]).not.toBe(second.mock.calls[0][1]);
    });

    it('produces filename without extension when original has none', () => {
      const cb = jest.fn();

      storage.filename?.(request, makeFile({ originalname: 'avatar' }), cb);

      const [, filename] = cb.mock.calls[0] as [Error | null, string];
      expect(filename).toMatch(UUID_REGEX);
    });
  });

  describe('limits', () => {
    it('limits file size to 2 MB', () => {
      expect(multerOptions.limits.fileSize).toBe(2 * 1024 * 1024);
    });
  });

  describe('fileFilter', () => {
    it.each(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])(
      'accepts %s',
      (mimetype) => {
        const cb = jest.fn();

        multerOptions.fileFilter(request, makeFile({ mimetype }), cb);

        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(null, true);
      },
    );

    it.each([
      'image/gif',
      'image/svg+xml',
      'application/pdf',
      'text/plain',
      'application/octet-stream',
    ])('rejects %s with BadRequestException', (mimetype) => {
      const cb = jest.fn();

      multerOptions.fileFilter(request, makeFile({ mimetype }), cb);

      expect(cb).toHaveBeenCalledTimes(1);
      const [error, accept] = cb.mock.calls[0] as [Error | null, boolean];
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error?.message).toBe('Допустимы только изображения');
      expect(accept).toBe(false);
    });
  });
});
