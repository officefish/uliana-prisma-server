import { Module } from '@nestjs/common'
import { FortuneController } from './fortune.controller'
import { AppConfigModule } from '@/modules/config/config.module'
import { TokenModule } from '@/modules/token/token.module'
import { PlayerModule } from '../player/player.module'
import { PrismaModule } from '@/modules/prisma/prisma.module'
import { FortuneService } from './fortune.service'
import { BalanceModule } from '../balance/balance.module'
import { PlayerService } from '../player/player.service'
import { BalanceService } from '../balance/balance.service'

@Module({
  imports: [PrismaModule,
    PlayerModule,
    BalanceModule,
    TokenModule,
    AppConfigModule],  
  controllers: [FortuneController],
  providers: [
      FortuneService, PlayerService, BalanceService 
    ],

})
export class FortuneModule {}