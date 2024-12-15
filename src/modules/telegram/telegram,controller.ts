import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators';

@ApiTags('telegram')
@Public()
@Controller('telegram')
export class TelegramController {
  private logger = new Logger(TelegramController.name)
  constructor(private readonly telegramService: TelegramService) {}

  @Get('set-menu-button')
  async setMenuButton(@Query('chatId') chatId: number): Promise<string> {
    const status = await this.telegramService.setMenuButton(chatId);
    if (status) {
      return 'Кнопка добавлена!';
    }
    return 'Не вышло :('
  }

  @Post('set-menu-button')
  async setMenuButtonWithUrl(
    @Body() body: { chat_id: string, text: string, url: string }): Promise<string> {

    this.logger.log(`Someone tries to set the menu button with chatId: ${body.chat_id}, text:${body.text}, url: ${body.url}`)  
    const status = await this.telegramService.setMenuButtonWithUrl(+body.chat_id, body.text, body.url);
    if (status) {
      return 'Кнопка добавлена!';
    }
    return 'Не вышло :('
  }
}