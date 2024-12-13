import { Injectable } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AppConfigService } from '@modules/config/config.service'
import { CryptoService } from '@modules/crypto/crypto.service'
import {
  RegenerateSessionInput,
  CreateCookieInput,
  CreateTokensInput,
  ClearCookieInput,
} from './accessory.types'

@Injectable()
export class AccessoryService {
  constructor(
    private readonly env: AppConfigService,
    private readonly crypto: CryptoService,
  ) {}

  /* Expires */

  async nowPlusMinutes(delay: number) {
    const expires = new Date()
    expires.setMinutes(expires.getMinutes() + delay)
    return expires
  }

  async nowPlusDays(delay: number) {
    const expires = new Date()
    expires.setDate(expires.getDate() + delay)
    return expires
  }

  /* Cookies service */

  async createCookie(input: CreateCookieInput) {
    input.reply.cookies[input.name] = input.value
    input.reply.setCookie(input.name, input.value, input.options)
  }

  async clearCookie(input: ClearCookieInput) {
    input.reply.cookies[input.name] = undefined
    input.reply.clearCookie(input.name, input.options)
  }

  async signAsync(userId: string, userName: string) {
    const payload = { sub: userId, userName }
    const options = { secret: this.env.getJwtSignature() }
    return await this.crypto.signAsync(payload, options)
  }

  async verifyAsync(token: string): Promise<string | undefined> {
    const options = { secret: this.env.getJwtSignature() }
    const payload = await this.crypto.verifyAsync(token, options)
    const id = payload.userId || payload.sub || undefined
    return id
  }

  async createTokenCookies(input: CreateTokensInput) {
    const { userId, sessionId, reply, options } = input
    const accessTokenMinutes = this.env.getAccessTokenMinutes()
    const refreshTokenDays = this.env.getRefreshTokenDays()

    const accessToken = await this.crypto.signAsync({ userId, sessionId })

    const accessExpires = await this.nowPlusMinutes(accessTokenMinutes)
    const accessOptions = { ...options, expires: accessExpires }

    this.createCookie({
      reply,
      name: 'access-token',
      value: accessToken,
      options: accessOptions,
    })

    const refreshToken = await this.crypto.signAsync({ sessionId })
    const refreshExpires = await this.nowPlusDays(refreshTokenDays)
    const refreshOptions = { ...options, expires: refreshExpires }
    this.createCookie({
      reply,
      name: 'refresh-token',
      value: refreshToken,
      options: refreshOptions,
    })
  }

  /* Session service */

  async regenerateSession(input: RegenerateSessionInput) {
    const maxAge = this.env.getSessionMaxAge()
    const sessionExpires = new Date(Date.now() + maxAge)
    const options = {
      ...input.request.server.cookieOptions,
      expires: sessionExpires,
    }

    let sessionId = ''
    // vitest request has no session, so we should ignore creating cookies in this way
    if (input.request.session) {
      await input.request.session.regenerate()
      sessionId = input.request.session.sessionId || undefined
      input.request.session.userId = input.userId
      input.request.session.userRole = input.userRole || Role.GUEST

      this.createCookie({
        reply: input.reply,
        name: 'sessionId',
        value: sessionId,
        options,
      })
    }

    return { sessionId, options }
  }
}