import './utils/setup-env';
import { INestApplication } from '@nestjs/common';
import { unlinkSync } from 'fs';
import { join } from 'path';
import { createE2eApp, e2eRequest } from './utils/create-e2e-app';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

describe('Upload (e2e)', () => {
  let app: INestApplication;
  const uploadedFiles: string[] = [];

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    for (const filename of uploadedFiles) {
      try {
        unlinkSync(join(process.cwd(), 'public', 'uploads', filename));
      } catch {
        // файл мог не создаться
      }
    }
    await app.close();
  });

  it('returns 400 when file is not sent', async () => {
    const response = await e2eRequest(app).post('/api/upload');

    expect(response.status).toBe(400);
  });

  it('uploads an image and returns a public url', async () => {
    const response = await e2eRequest(app)
      .post('/api/upload')
      .attach('file', PNG_1X1, {
        filename: 'avatar.png',
        contentType: 'image/png',
      });

    expect(response.status).toBe(201);

    const body = response.body as { url: string };
    expect(body.url).toMatch(/^\/uploads\/.+\.png$/);
    uploadedFiles.push(body.url.replace('/uploads/', ''));
  });

  it('returns 400 when file is not an image', async () => {
    const response = await e2eRequest(app)
      .post('/api/upload')
      .attach('file', Buffer.from('not-an-image'), {
        filename: 'notes.txt',
        contentType: 'text/plain',
      });

    expect(response.status).toBe(400);
  });

  it('returns 413 when file is larger than 2mb', async () => {
    const response = await e2eRequest(app)
      .post('/api/upload')
      .attach('file', Buffer.alloc(2 * 1024 * 1024 + 1), {
        filename: 'huge.png',
        contentType: 'image/png',
      });

    expect(response.status).toBe(413);
  });
});
