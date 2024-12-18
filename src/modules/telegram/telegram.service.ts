import { TelegramUserType } from '@/helpers/types/telegram-user.type';
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { AppConfigService } from '../config/config.service';
import * as qs from 'querystring'; // Use querystring to easily parse URL-encoded strings
import { HttpService } from '@nestjs/axios';
import { Bot, Context, InlineKeyboard } from 'grammy'
import { InjectBot } from '@grammyjs/nestjs'
import { lastValueFrom } from 'rxjs';
import { PreCheckoutQuery } from 'grammy/types';


@Injectable()
export class TelegramService {

    private readonly logger = new Logger(TelegramService.name)

    constructor(
        private readonly config: AppConfigService,
        private readonly httpService: HttpService,
        @Inject('TELEGRAM_GRAMMY_BOT') private readonly bot: Bot<Context> 
      ) {
        this.setupListeners();
      }

      private setupListeners() {
  
        this.bot.on('pre_checkout_query', async (ctx) => {
          //const query = ctx.callbackQuery; // используем callbackQuery для доступа к preCheckoutQuery
          
          // Логика обработки preCheckoutQuery
          await ctx.answerPreCheckoutQuery(true); // Здесь true означает, что предзаказ подтвержден
          //await ctx.reply('Ваш заказ принят! Ожидайте дальнейших инструкций.');
    
          // Вы также можете использовать другие поля из query, например:
          //console.log('PreCheckoutQuery:', query);
        });

        // this.bot.command('start', (ctx) => {
        //   ctx.reply('Нажмите на кнопку, чтобы открыть Web App:', {
            
        //     reply_markup: new InlineKeyboard().url(
        //       'Запустить Web App',
        //       't.me/uliana_prisma_bot/uliana_prisma', // URL Web Telegram или вашего приложения
        //     ),
        //   });

        //   this.logger.log("But start command listener added")
        // });

        this.bot.catch(async (error) => {
          console.error('Произошла ошибка!', error);
        });

        this.bot.start()
      }

  getTelegramApiUrl() {
    return `https://api.telegram.org/bot${this.config.getTelegramBotToken()}`
  }     

  // Метод для настройки кнопки WebApp
  async setMenuButton(chatId: number) : Promise<boolean> {
    const url = `${this.getTelegramApiUrl()}/setChatMenuButton`;
    const menuBtnStr = JSON.stringify({
      type: 'web_app',
      text: 'Магический шар',
      web_app: {
          url: 'https://t.me/uliana_prisma_bot/uliana_prisma'
      }
    })

    const data = {
      chat_id: chatId,
      menu_button: menuBtnStr 
    }
    try {
      const response = await lastValueFrom(this.httpService.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      }));
      const responseData = response.data;

      this.logger.log('Launch button success installed')
      this.logger.log(responseData)
      return true

    } catch (error) {
      this.logger.error('Error checking subscription status:', error);
      return false
    } 

  }

  async setMenuButtonWithUrl(chat_id: number, text: string, url: string) : Promise<boolean> {
    const botUrl = `${this.getTelegramApiUrl()}/setChatMenuButton`;
    const data = {
      chat_id,
      menu_button: JSON.stringify({
        type: 'web_app',
        text,
        web_app: { url }
    })}
    try {
      const response = await lastValueFrom(this.httpService.post(botUrl, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      }));
      const responseData = response.data;

      this.logger.log('Launch button success installed')
      this.logger.log(responseData)
      return true

    } catch (error) {
      this.logger.error('Error checking subscription status:', error);
      return false
    } 

  }

  async setMenuButtonWithBot(chatId: number) : Promise<boolean> {
    const url = `${this.getTelegramApiUrl()}/setChatMenuButton`;
    const menuBtnStr = JSON.stringify({
      type: 'web_app',
      text: 'Магический шар',
      web_app: {
          url: "https://t.me/uliana_prisma_bot/uliana_prisma"
      }
    }) as any

    const data = {
      "chat_id": chatId,
      "menu_button": menuBtnStr 
    }
    try {
      //this.bot.raw.setChatMenuButton(data);
      // this.logger.log('Launch button success installed')
      // this.logger.log(responseData)
      return true

    } catch (error) {
      this.logger.error('Error checking subscription status:', error);
      return false
    } 

  }

      
  validateInitData(initData: string): boolean {
    const token = this.config.getTelegramBotToken();

    const parsedData = new URLSearchParams( initData );

    parsedData.sort();

    const hash = parsedData.get( "hash" );
    parsedData.delete( "hash" );

    const dataToCheck = [...parsedData.entries()].map( ( [key, value] ) => key + "=" + value ).join( "\n" );

    const secretKey = crypto.createHmac( "sha256", "WebAppData" ).update( token ).digest();

    const hmac = crypto.createHmac( "sha256", secretKey ).update( dataToCheck ).digest( "hex" );

    console.log('hmac: ', hmac);
    console.log('hash: ', hash);

    return hash === hmac;
  }

  extractUserData(initData: string): TelegramUserType {
    const parsedData = qs.parse(initData);

    // Decode and parse the `user` field, which is a JSON-encoded string
    const userJson = parsedData['user'] as string;
    const userData = JSON.parse(decodeURIComponent(userJson));

    // Map the parsed data to the TelegramUserType and return it
    const user: TelegramUserType = {
      id: userData.id.toString(),
      firstName: userData.first_name,
      lastName: userData.last_name || undefined,
      username: userData.username || undefined,
      language_code: userData.language_code || undefined,
      allows_write_to_pm: userData.allows_write_to_pm || undefined,
    };
    
    return user;
  }

  // Проверка статуса пользователя в канале
  async checkUserSubscription(channelUsername: string, tgId: string): Promise<boolean> {
    try {
      const url = `${this.getTelegramApiUrl()}/getChatMember?chat_id=@${channelUsername}&user_id=${tgId}`;
      const response = await lastValueFrom(this.httpService.get(url));
      //const response = await this.bot.api.getChatMembers({chat_id:channelUsername, user_id: tgId});
      const data = response.data;

      // Проверяем статус пользователя
      const status = data.result.status;
      return status === 'member' || status === 'administrator' || status === 'creator';
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  async byGemsForStars(numKeys: number) {
    const title = "Buy gems for starts";
    const description = "This gems needs to do some magic!";
    const payload = "{}";
    const currency = "XTR";
    const prices = [{ amount: numKeys, label: "Magic gems" }];
  

    // try {
    //   const url = `${this.getTelegramApiUrl()}/createInvoiceLink?title=${title}&description=${description}&payload=${payload}&currency=${currency}&prices=${JSON.stringify(prices)}`;
    //   const response = await this.httpService.get(url).toPromise();
    //   const data = response.data;

    //   return data
     
    // } catch (error) {
    //   throw new BadRequestException('Failed to create invoice link')
    // }

    const invoiceLink = await this.bot.api.createInvoiceLink(
      title,
      description,
      payload,
      "", // Provider token must be empty for Telegram Stars
      currency,
      prices
    )
  
    if(!invoiceLink) {
       throw new BadRequestException('Failed to create invoice link');
     }

    return invoiceLink;
  }
}