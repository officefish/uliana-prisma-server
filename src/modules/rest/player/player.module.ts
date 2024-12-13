import { Module } from '@nestjs/common'
import { PlayerController } from './player.controller'
import { PlayerService } from './player.service'
import { TokenModule } from '@/modules/token/token.module'

@Module({
  imports: [
   TokenModule,
  ],
  controllers : [PlayerController],
  providers: [
    PlayerService 
  ],
})
export class PlayerModule {}