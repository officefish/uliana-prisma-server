//import { INestApplication, Logger } from '@nestjs/common'
import { Logger } from '@nestjs/common'
//import { join } from 'path'
//import fastifyStatic from '@fastify/static'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import * as path from 'path'

export function initializeStaticAssets(app: NestFastifyApplication) {
  const root = path.join(process.cwd(), 'public')
  app.useStaticAssets({
    root,
    //root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  })

  //const server = app.getHttpAdapter().getInstance()
  //await server.after()

  //server.register(fastifyStatic, { root }).after(() => {
  //server.log.info('Static Plugin Installed.')
  //server.log.info(`Static root is: ${root}`)
  //  Logger.log('Fastify static registered', 'Static Assets')
  //})

  //app.register(fastifyStatic, {
  //  root: join(__dirname, 'public'),
  //  prefix: '/public/', // optional: default '/'
  //constraints: { host: 'example.com' } // optional: default {}
  //})

  Logger.log('Static assets initialized', 'Static Assets')
}