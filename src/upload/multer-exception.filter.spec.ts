import {
  ArgumentsHost,
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { MulterError } from 'multer';
import { MulterExceptionFilter } from './multer-exception.filter';

describe('MulterExceptionFilter', () => {
  let filter: MulterExceptionFilter;
  const host = {} as ArgumentsHost;

  beforeEach(() => {
    filter = new MulterExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('throws PayloadTooLargeException for LIMIT_FILE_SIZE', () => {
    const exception = new MulterError('LIMIT_FILE_SIZE', 'file');

    expect(() => filter.catch(exception, host)).toThrow(
      PayloadTooLargeException,
    );
    expect(() => filter.catch(exception, host)).toThrow('Файл слишком большой');
  });

  it.each([
    'LIMIT_UNEXPECTED_FILE',
    'LIMIT_FILE_COUNT',
    'LIMIT_PART_COUNT',
    'LIMIT_FIELD_KEY',
  ] as const)(
    'throws BadRequestException with original message for %s',
    (code) => {
      const exception = new MulterError(code, 'file');

      expect(() => filter.catch(exception, host)).toThrow(BadRequestException);
      expect(() => filter.catch(exception, host)).toThrow(exception.message);
    },
  );

  it('does not wrap non-size errors into PayloadTooLargeException', () => {
    const exception = new MulterError('LIMIT_UNEXPECTED_FILE', 'file');

    expect(() => filter.catch(exception, host)).not.toThrow(
      PayloadTooLargeException,
    );
  });
});
