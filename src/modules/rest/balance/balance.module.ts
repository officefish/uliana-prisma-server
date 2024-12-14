import { Module } from '@nestjs/common'

import { TokenModule } from '@/modules/token/token.module'
import { PlayerModule } from '../player/player.module'
import { PlayerService } from '../player/player.service'
import { BalanceController } from './balance.controller'
import { BalanceService } from './balance.service'

@Module({
  imports: [
   TokenModule,
   PlayerModule
  ],
  controllers : [BalanceController],
  providers: [
    PlayerService,
    BalanceService 
  ],
})
export class BalanceModule {}