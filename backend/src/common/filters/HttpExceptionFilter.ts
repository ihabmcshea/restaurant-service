import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Check if exceptionResponse is an object
    const isObject = (val: any): val is { [key: string]: any } =>
      val !== null && typeof val === 'object';

    const responseBody = isObject(exceptionResponse)
      ? { ...exceptionResponse }
      : { message: exceptionResponse };

    response.status(status).json({
      statusCode: status,
      ...responseBody,
    });
  }
}
