import { Injectable, OnModuleInit } from '@nestjs/common';
import { mkdirSync } from 'fs';
import { UPLOAD_DIR } from './multer.options';

@Injectable()
export class UploadService implements OnModuleInit {
  onModuleInit() {
    this.ensureUploadDir();
  }

  ensureUploadDir(): void {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  getPublicUrl(filename: string): { url: string } {
    return { url: `/uploads/${filename}` };
  }
}
