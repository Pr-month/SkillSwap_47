import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  PayloadTooLargeException,
} from '@nestjs/common';
import { MulterError } from 'multer';

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    void host;
    if (exception.code === 'LIMIT_FILE_SIZE') {
      throw new PayloadTooLargeException('Файл слишком большой');
    }

    throw new BadRequestException(exception.message);
  }
}
