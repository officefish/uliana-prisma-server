import { Module } from '@nestjs/common'

import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { TokenModule } from '@modules/token/token.module'

import { ReferralsModule } from '@modules/rest/referrals/referrals.module'
import { AppConfigModule } from '@modules/config/config.module'
import { TelegramModule } from '@modules/telegram/telegram.module'
import { PlayerModule } from '../player/player.module'
import { PlayerService } from '../player/player.service'

@Module({
  imports: [TokenModule, ReferralsModule, AppConfigModule, TelegramModule, PlayerModule],
  controllers: [AuthController],
  providers: [AuthService, PlayerService],
})
export class AuthModule {}