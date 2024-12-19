import { Module } from '@nestjs/common'
import { AppConfigModule } from '@/modules/config/config.module'
import { TokenModule } from '@/modules/token/token.module'
import { PlayerModule } from '../player/player.module'
import { PrismaModule } from '@/modules/prisma/prisma.module'
import { BalanceModule } from '../balance/balance.module'
import { PlayerService } from '../player/player.service'
import { BalanceService } from '../balance/balance.service'
import { ActionModule } from '../action/action.module'
import { ActionGameplayService } from '../action/action.gameplay.service'
import { LocationController } from './location.controller'
import { LocationService } from './location.service'

@Module({
  imports: [PrismaModule,
    PlayerModule,
    BalanceModule,
    TokenModule,
    AppConfigModule,
    ActionModule,
  ],  
  controllers: [LocationController],
  providers: [
      LocationService, PlayerService, BalanceService
    ],

})
export class LocationModule {}