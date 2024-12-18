import { 
    BadRequestException, 
    Injectable, Logger, 
    NotFoundException
} from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Action, ActionInstance, Prisma } from '@prisma/client';
import { CreateActionDto } from './dto/create-action.dto';

//import { Player, TelegramAccount } from '@prisma/client';


@Injectable()
export class ActionService {
  private readonly logger = new Logger(ActionService.name)  

  constructor(private prisma: PrismaService) {}
 /**
   * Converts a CreateActionDto into Prisma.ActionCreateInput
   */
 async createActionInput(dto: CreateActionDto): Promise<Prisma.ActionCreateInput> {
    return {
      type: dto.type,
      price: dto.price
        ? {
            create: {
              resource: dto.price.resource,
              value: dto.price.value,
              percentage: dto.price.percentage || null,
            },
          }
        : undefined,
      effect: dto.effect
        ? {
            create: {
              resource: dto.effect.resource,
              value: dto.effect.value,
              effect: dto.effect.effect,
              percentage: dto.effect.percentage || null,
            },
          }
        : undefined,
    };
  }


  // Получить все действия
  async getAllActions(): Promise<Action[]> {
    return this.prisma.action.findMany({
      include: {
        price: true,
        effect: true,
      },
    });
  }

  // Создать новое действие
  async createAction(data: Prisma.ActionCreateInput): Promise<Action> {
    return this.prisma.action.create({
      data,
    });
  }

  // Создать экземпляр действия
  async createActionInstance(data: Prisma.ActionInstanceCreateInput): Promise<ActionInstance> {
    return this.prisma.actionInstance.create({
      data,
    });
  }

  // Получить конкретное действие по ID
  async getActionById(id: string): Promise<Action | null> {
    return this.prisma.action.findUnique({
      where: { id },
      include: {
        price: true,
        effect: true,
      },
    });
  }
}


