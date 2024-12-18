import { Module } from '@nestjs/common'
import { AppConfigModule } from '@/modules/config/config.module'
import { TokenModule } from '@/modules/token/token.module'
import { PlayerModule } from '../player/player.module'
import { PrismaModule } from '@/modules/prisma/prisma.module'
import { BalanceModule } from '../balance/balance.module'
import { PlayerService } from '../player/player.service'
import { BalanceService } from '../balance/balance.service'
import { ActionService } from './action.service'
import { ActionController } from './action.controller'
import { ActionGameplayService } from './action.gameplay.service'


@Module({
  imports: [PrismaModule,
    PlayerModule,
    BalanceModule,
    TokenModule,
    AppConfigModule],  
  controllers: [ActionController],
  providers: [
      ActionService, PlayerService, BalanceService, ActionGameplayService 
    ],
  exports: [ActionService, ActionGameplayService]

})
export class ActionModule {}