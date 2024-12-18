import { 
    BadRequestException, 
    Injectable, Logger, 
    NotFoundException
} from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Action, ActionInstance, ActionType, EffectType, Prisma, ResourceType } from '@prisma/client';
import { CreateActionDto } from './dto/create-action.dto';
import { ActionService } from './action.service';
import { PlayerService } from '../player/player.service';

//import { Player, TelegramAccount } from '@prisma/client';


@Injectable()
export class ActionGameplayService {
  private readonly logger = new Logger(ActionGameplayService.name);

  constructor(
    private prisma: PrismaService,
    private actionService: ActionService,
    private playerService: PlayerService
  ) {}

  /**
   * Finds an Action of type BAWDRY or creates one if it doesn't exist.
   */
  async findOrCreateBawdryAction(): Promise<Action> {
    // Попробуем найти Action с типом BAWDRY
    const existingAction = await this.prisma.action.findFirst({
      where: {
        type: ActionType.BAWDRY,
      },
    });

    // Если нашли, возвращаем найденное действие
    if (existingAction) {
      return existingAction;
    }

    // Если не нашли, создаем новый шаблон
    const newAction = await this.prisma.action.create({
      data: {
        type: 'BAWDRY',
        // Вы можете задать здесь значения для `price` и `effect`, если это необходимо
        price: {
          create: {
            resource: ResourceType.GEMS,
            value: 1,
          },
        },
        effect: {
          create: {
            resource: ResourceType.ENERGY,
            effect: EffectType.DECREASING,
            value: 0,
            percentage: 10,
          },
        },
      },
    });

    return newAction;
  }

   /**
   * Creates a BAWDRY action instance for a given player.
   */
   async createBawdryActionInstance(playerId: string, targetId?: string): Promise<ActionInstance & {template: Action}> {
    // Найти или создать шаблон действия BAWDRY
    const bawdryAction = await this.findOrCreateBawdryAction();

    // Создать экземпляр действия для игрока
    const actionInstance = await this.prisma.actionInstance.create({
      data: {
        player: {
          connect: {
            id: playerId,
          },
        },
        target: targetId
          ? {
              connect: {
                id: targetId,
              },
            }
          : undefined,
        template: {
          connect: {
            id: bawdryAction.id,
          },
        },
        uuid: crypto.randomUUID(), // Генерация уникального идентификатора
      },
      include: {
        template : true
      }
    });

    return actionInstance;
  }
}



