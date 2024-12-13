import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { AppConfigModule } from 'src/modules/config/config.module';
import { PingPongModule } from '@/modules/rest/ping-pong/ping-pong.module';
import { PlayerModule } from '@/modules/rest/player/player.module';

@Module({
  imports: [
    PrismaModule,
    AppConfigModule,
    PingPongModule,
    PlayerModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
