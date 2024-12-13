import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt/dist'
import { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt/dist'

interface UserPayload {
  userId?: string
  sessionId?: string
  userName?: string
  sub?: string
  iat: number
}

@Injectable()
export class CryptoService {
  constructor(private readonly jwt: JwtService) {}

  async compare(requestPassword: string, databasePassword: string) {
    //console.log(requestPassword, databasePassword)
    //console.log(this.bcrypt)

    return await bcrypt.compare(requestPassword, databasePassword)
  }

  generateSalt(length: number) {
    return bcrypt.genSalt(length)
  }

  hash(payload: string, salt: string) {
    return bcrypt.hash(payload, salt)
  }

  /* Jwt */
  async signAsync(payload: object | Buffer, options?: JwtSignOptions) {
    return await this.jwt.signAsync(payload, options)
  }

  async verifyAsync(token: string, options?: JwtVerifyOptions) {
    return (await this.jwt.verify(token, options)) as UserPayload
  }
}