import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Response<T> {
  data: T
  statusCode: number
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const response = context.switchToHttp().getResponse<{ statusCode?: number }>()
    const statusCode = typeof response.statusCode === 'number' ? response.statusCode : 500
    return next.handle().pipe(map((data) => ({ statusCode, data })))
  }
}
