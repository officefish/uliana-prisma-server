import { Module } from '@nestjs/common'
import { FortuneController } from './fortune.controller'
import { AppConfigModule } from '@/modules/config/config.module'
import { TokenModule } from '@/modules/token/token.module'
import { PlayerModule } from '../player/player.module'
import { PrismaModule } from '@/modules/prisma/prisma.module'

@Module({
  imports: [PrismaModule,
    PlayerModule,
    TokenModule,
    AppConfigModule],  
  controllers: [FortuneController],
})
export class FortuneModule {}