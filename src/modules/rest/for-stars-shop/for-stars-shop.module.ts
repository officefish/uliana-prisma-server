import { Module } from '@nestjs/common'
import { PrismaModule } from '@modules/prisma/prisma.module'
import { PrismaService } from '@modules/prisma/prisma.service'
import { PlayerModule } from '../player/player.module'
import { TokenModule } from '@modules/token/token.module'
import { ForStarsShopController } from './for-stars-shop.controller'
import { TelegramModule } from '../../telegram/telegram.module'
import { TelegramService } from '../../telegram/telegram.service'
import { AppConfigModule } from '../../config/config.module'
import { AppConfigService } from '../../config/config.service'
import { HttpModule } from '@nestjs/axios'
import { PlayerService } from '../player/player.service'
//import { ShopService } from './shop.service'

@Module({
  imports: [
   PrismaModule,
   PlayerModule,
   TokenModule,
   AppConfigModule,
   TelegramModule,
   HttpModule,
   PlayerModule
  ],
  controllers : [ForStarsShopController],
  providers: [
    PrismaService,
    TelegramService, 
    AppConfigService,
    TelegramService,
    PlayerService
  ],
})
export class ForStarsShopModule {}