import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs'
  import { tap } from 'rxjs/operators'
  
  @Injectable()
  export class ClearCookieInterceptor implements NestInterceptor {
    constructor() {}
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const ctx = context.switchToHttp()
      const response = ctx.getResponse()
  
      return next.handle().pipe(
        tap(async (data) => {
          if (data && data.refreshToken) {
        
              try {
                response.clearCookie('refreshToken')
              } catch (error) {
                console.error('Error storing token in Redis:', error)
              }
            } else {
              console.warn('Authorization header is missing or malformed');
            }
        })
    )}
}