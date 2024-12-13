import { INestApplication, Logger } from '@nestjs/common'
import { fastifySession } from '@fastify/session'
//import secureSession from '@fastify/secure-session'
import { Role } from '@prisma/client'

declare module 'fastify' {
  interface Session {
    userId?: string
    userRole?: Role
    id?: string
  }
}

export function initializeSession(app: INestApplication) {
  const secret = process.env.SESSION_SIGNATURE

  const server = app.getHttpAdapter().getInstance()
  server.register(fastifySession, {
    secret,
    cookieName: 'sessionId',
    cookie: { secure: false },
    salt: 'mq9hDxBVDbspDR6n',
  })

  server.addHook('onRequest', (request, reply, next) => {
    if (request.session.userRole === undefined) {
      request.session.userRole = Role.GUEST
    }
    next()
  })

  Logger.log('Fastify session initialized', 'Bootstrap')
}