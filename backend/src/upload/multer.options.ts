import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export const multerOptions = {
  storage: diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req: Request, file: Express.Multer.File, cb) => {
      cb(null, `${randomUUID()}${extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      cb(new BadRequestException('Допустимы только изображения'), false);
      return;
    }
    cb(null, true);
  },
};
