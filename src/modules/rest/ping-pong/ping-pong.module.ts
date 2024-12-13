import { Module } from '@nestjs/common'
import { PingPongController } from './ping-pong.controller'

@Module({
  controllers: [PingPongController],
})
export class PingPongModule {}