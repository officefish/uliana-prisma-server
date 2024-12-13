import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { AppConfigModule } from 'src/modules/config/config.module';
import { PingPongModule } from '@/modules/rest/ping-pong/ping-pong.module';
import { PlayerModule } from '@/modules/rest/player/player.module';
import { AuthModule } from '@/modules/rest/auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AppConfigModule,
    PingPongModule,
    PlayerModule,
    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
