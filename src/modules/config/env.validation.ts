import { plainToInstance, ClassTransformOptions } from 'class-transformer'
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  //IsIP,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator'

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsString()
  API_VERSION: string

  @IsString()
  DATABASE_URL: string

  @IsEnum(Environment)
  NODE_ENV: Environment

  @IsString()
  JWT_SIGNATURE: string

  @IsString()
  JWT_ACCESS_EXPIRES_IN: string

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string

  @IsNumber()
  JWT_SALT_LENGTH: number

  @IsString()
  DEV_HOST: string

  @IsString()
  PROD_HOST: string

  @IsNumber()
  DEV_PORT: number

  @IsNumber()
  PROD_PORT: number

  @IsString()
  COOKIE_SIGNATURE: string

  @IsBoolean()
  COOKIE_HTTPONLY: boolean

  @IsBoolean()
  COOKIE_SECURE: boolean

  @IsString()
  COOKIE_PATH: string

  @IsString()
  SESSION_SIGNATURE: string

  @IsNumber()
  SESSION_TOKEN_LENGTH: number

  @IsNumber()
  SESSION_MAX_AGE: number

  @IsString()
  AVATAR_URL: string

  @IsString()
  COVER_URL: string

  @IsString()
  SENTRY_DSN: string

  @IsString()
  TELEGRAM_BOT_TOKEN: string

  @IsString()
  NEW_RELIC_LICENCE_KEY: string
  
  @IsString()
  NEW_RELIC_APPLICATION_NAME: string
}

export function validate(config: Record<string, unknown>) {
  const transformOptions = {
    enableImplicitConversion: true,
  } satisfies ClassTransformOptions
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    transformOptions,
  )
  const errors = validateSync(validatedConfig, { skipMissingProperties: false })

  if (errors.length > 0) {
    throw new Error(errors.toString())
  }
  return validatedConfig
}