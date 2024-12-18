import { Module } from '@nestjs/common'
import { TelegramService } from './telegram.service'
import { HttpModule } from '@nestjs/axios';  // Импортируем HttpModule
import { NestjsGrammyModule } from '@grammyjs/nestjs'
import { AppConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/config.service';
import { TelegramController } from './telegram,controller';
import { Bot, Context, InlineKeyboard } from 'grammy'


@Module({
    imports: [
      HttpModule,
      AppConfigModule,
      // NestjsGrammyModule.forRoot({
      //      token: process.env.TELEGRAM_BOT_TOKEN,
      // }),
    ],

  
    controllers: [TelegramController],
    providers: [
      TelegramService, 
      AppConfigService,
      {
        provide: 'TELEGRAM_GRAMMY_BOT',
        useFactory: (configService: AppConfigService) => {
          const bot = new Bot(configService.getTelegramBotToken());
  
          // Add bot commands or handlers here
          bot.command('start', (ctx) => ctx.reply('Hello! Welcome to my bot.'));
  
          return bot;
        },
        inject: [AppConfigService],
      },
    ],
    exports: [TelegramService, 'TELEGRAM_GRAMMY_BOT'],
})
export class TelegramModule {}