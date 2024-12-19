import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { AppConfigModule } from 'src/modules/config/config.module';
import { PingPongModule } from '@/modules/rest/ping-pong/ping-pong.module';
import { PlayerModule } from '@/modules/rest/player/player.module';
import { AuthModule } from '@/modules/rest/auth/auth.module';
import { ForStarsShopModule } from '@/modules/rest/for-stars-shop/for-stars-shop.module';
import { BalanceModule } from '@/modules/rest/balance/balance.module';
import { FortuneModule } from '@/modules/rest/fortune/fortune.module';
import { LocationModule } from '@/modules/rest/location/location.module';

@Module({
  imports: [
    PrismaModule,
    AppConfigModule,
    PingPongModule,
    PlayerModule,
    AuthModule,
    ForStarsShopModule,
    BalanceModule,
    FortuneModule,
    LocationModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
