import { Controller, Get, Query } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators';

@ApiTags('telegram')
@Public()
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get('set-menu-button')
  async setMenuButton(@Query('chatId') chatId: number): Promise<string> {
    const status = await this.telegramService.setMenuButton(chatId);
    if (status) {
      return 'Кнопка добавлена!';
    }
    return 'Не вышло :('
  }
}