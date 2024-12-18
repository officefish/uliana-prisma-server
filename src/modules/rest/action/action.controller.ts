import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ActionService } from './action.service';
import { Prisma } from '@prisma/client';
import { CreateActionDto } from './dto/create-action.dto';

@Controller('actions')
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  // Получить все действия
  @Get()
  async getAllActions() {
    return this.actionService.getAllActions();
  }

  // Получить конкретное действие по ID
  @Get(':id')
  async getActionById(@Param('id') id: string) {
    return this.actionService.getActionById(id);
  }

  // Создать новое действие
  @Post()
  async createAction(@Body() body: CreateActionDto) {
    
    const input = await this.actionService.createActionInput(body);
    
    return this.actionService.createAction(input);
  }

  // Создать экземпляр действия
  @Post('instance')
  async createActionInstance(@Body() data: Prisma.ActionInstanceCreateInput) {
    return this.actionService.createActionInstance(data);
  }
}
