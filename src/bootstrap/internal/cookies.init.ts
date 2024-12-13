import { INestApplication, Logger } from '@nestjs/common'
import { fastifyCookie } from '@fastify/cookie'
import type { FastifyCookieOptions } from '@fastify/cookie'

declare module 'fastify' {
  interface FastifyInstance {
    cookieOptions: FastifyCookieOptions
  }
}

export function initializeCookies(app: INestApplication) {
  const host =
    process.env.NODE_ENV === 'development'
      ? '.localhost'
      : process.env.PROD_HOST

  const secure =
    process.env.NODE_ENV === 'development' ? process.env.COOKIE_SECURE : false

  const sameSite = process.env.NODE_ENV === 'development' ? 'lax' : 'strict'

  const parseOptions = {
    domain: `${host}`,
    httpOnly: process.env.COOKIE_HTTPONLY,
    path: process.env.COOKIE_PATH,
    secure,
    sameSite,
  }

  const server = app.getHttpAdapter().getInstance()

  server.decorate('cookieOptions', parseOptions)

  const cookieContext = {}
  server.decorateReply('cookies', { getter: () => cookieContext })

  const secret = process.env.COOKIE_SIGNATURE

  server.register(fastifyCookie, {
    secret,
    hook: 'onRequest',
    parseOptions,
  } as unknown as FastifyCookieOptions)

  Logger.log(
    `Fastify cookies initialized with options: { domain: ${host}, secure:${secure}, sameSite:${sameSite} }`,
    'Bootstrap',
  )
}