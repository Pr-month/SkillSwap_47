import { mkdirSync } from 'fs';
import { UPLOAD_DIR } from './multer.options';
import { UploadService } from './upload.service';

jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
}));

const mkdirSyncMock = jest.mocked(mkdirSync);

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(() => {
    mkdirSyncMock.mockReset();
    service = new UploadService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ensureUploadDir', () => {
    it('creates upload directory recursively', () => {
      service.ensureUploadDir();

      expect(mkdirSyncMock).toHaveBeenCalledTimes(1);
      expect(mkdirSyncMock).toHaveBeenCalledWith(UPLOAD_DIR, {
        recursive: true,
      });
    });
  });

  describe('onModuleInit', () => {
    it('ensures upload directory exists on module init', () => {
      const ensureSpy = jest.spyOn(service, 'ensureUploadDir');

      service.onModuleInit();

      expect(ensureSpy).toHaveBeenCalledTimes(1);
      expect(mkdirSyncMock).toHaveBeenCalledWith(UPLOAD_DIR, {
        recursive: true,
      });
    });
  });

  describe('getPublicUrl', () => {
    it('returns public url for stored file', () => {
      expect(service.getPublicUrl('avatar.png')).toEqual({
        url: '/uploads/avatar.png',
      });
    });

    it('does not touch filesystem', () => {
      service.getPublicUrl('avatar.png');

      expect(mkdirSyncMock).not.toHaveBeenCalled();
    });
  });
});
