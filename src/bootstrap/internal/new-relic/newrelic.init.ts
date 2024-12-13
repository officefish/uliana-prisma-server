import { INestApplication, Logger } from '@nestjs/common'
import type { FastifyCookieOptions } from '@fastify/cookie'
import { NewrelicInterceptor } from './newrelic.interceptor';

declare module 'fastify' {
  interface FastifyInstance {
    cookieOptions: FastifyCookieOptions
  }
}

export function initializeNewRelic(app: INestApplication) {
    
    app.useGlobalInterceptors(new NewrelicInterceptor());
    
    Logger.log('New Relic initialized', 'Bootstrap')

}