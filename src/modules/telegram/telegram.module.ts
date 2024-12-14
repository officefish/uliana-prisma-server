import { Module } from '@nestjs/common'
import { TelegramService } from './telegram.service'
import { HttpModule } from '@nestjs/axios';  // Импортируем HttpModule
import { NestjsGrammyModule } from '@grammyjs/nestjs'
import { AppConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/config.service';
import { TelegramController } from './telegram,controller';


@Module({
    imports: [
      HttpModule,
      AppConfigModule,
      NestjsGrammyModule.forRoot({
          token: process.env.TELEGRAM_BOT_TOKEN,
      }),
      ],
  
    controllers: [TelegramController],
    providers: [TelegramService, AppConfigService],
    exports: [TelegramService],
})
export class TelegramModule {}