import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';

function convertDates(value: any): any {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(convertDates);
  if (value !== null && typeof value === 'object') {
    const result: Record<string, any> = {};
    for (const key in value) {
      result[key] = convertDates(value[key]);
    }
    return result;
  }
  return value;
}

@Injectable()
export class DateToIsoInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(map((data) => convertDates(data)));
  }
}
