import { FastifyRequest, FastifyReply } from 'fastify'
import { CookieOptions } from '@fastify/session'
import { Role } from '@prisma/client'

export type RegenerateSessionInput = {
  request: FastifyRequest
  reply: FastifyReply
  userId?: string
  userRole?: Role
}

export type ClearCookieInput = {
  reply: FastifyReply
  name: string
  options: CookieOptions
}

export interface CreateCookieInput extends ClearCookieInput {
  value: string
}

export type CreateTokensInput = {
  reply: FastifyReply
  userId: string
  sessionId: string
  options: CookieOptions
}