import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';

import { Player, TelegramAccount } from '@prisma/client';
import { CreatePlayerDto } from './dto/player.dto';

export type PlayerWithTgAccount = Player & {
  tgAccount: TelegramAccount; // Add the TelegramAccount relationship
};

@Injectable()
export class PlayerService {
  public readonly KEY_GENERATION_INTERVAL = 4 * 60 * 60 * 1000; // 4 часа в миллисекундах
  
  private readonly logger = new Logger(PlayerService.name)  

  constructor(private prisma: PrismaService) {}

  async getPlayerById(id: string) : Promise<PlayerWithTgAccount> {
    const player = await this.prisma.player.findUnique({ 
        where: { id },
        include: {
            tgAccount: true
        } 
    })
    if (!player) {
      const msg = `Player with tgId: ${id} not found.`
      this.logger.error(new Error(msg));
      throw new NotFoundException(msg);
    }
    return player
  }

  async getPlayerByTgId(tgId: string) : Promise<PlayerWithTgAccount>  {
    const account = await this.prisma.telegramAccount.findUnique({
        where: { tgId }
    })
    if (!account) {
       return null
      }

    const player = await this.prisma.player.findUnique({ 
        where: { 
            tgAccountId : account.id
        },
        include: {
            tgAccount: true
        }
    })
    if (!player) {
      return null
    }
    return player
  }

  async getPlayerActionsByTgId(tgId: string, skip: number, take: number) {
    const account = await this.prisma.telegramAccount.findUnique({
        where: { tgId }
    })
    if (!account) {
       return null
      }

      const playerId = account.id; // Предположим, что playerId известен

      // Получение данных игрока (без actions и received)
      const player = await this.prisma.player.findUnique({
        where: { tgAccountId: playerId },
      });
      
      // Получение actions с пагинацией
      const actions = await this.prisma.actionInstance.findMany({
        where: {
          playerId: player.id, // Связь по playerId
          targetId: {
            not: null, 
          },
        },
        include: {
          template: true,
          target: {
            include: { tgAccount: true },
          },
        },
        take, // Количество элементов на странице
        skip,  // Пропущенные элементы
      });
      
    if (!player) {
      return null
    }
    return actions  
  }

  async getPlayerReceivedActionsByTgId(tgId: string, skip: number, take: number) {
    const account = await this.prisma.telegramAccount.findUnique({
        where: { tgId }
    })
    if (!account) {
       return null
      }

      const playerId = account.id; // Предположим, что playerId известен

      // Получение данных игрока (без actions и received)
      const player = await this.prisma.player.findUnique({
        where: { tgAccountId: playerId },
      });
      
      // Получение received с пагинацией
      const received = await this.prisma.actionInstance.findMany({
        where: {
          targetId: player.id, // Связь по playerId
        },
        include: {
          template: true,
          player: {
            include: { tgAccount: true },
          },
        },
        take, // Количество элементов на странице
        skip,  // Пропущенные элементы
    });

    if (!player) {
      return null
    }
    return received   
  }


 0
  async getPlayerByTgIdWithLocation(tgId) {
    const account = await this.prisma.telegramAccount.findUnique({
      where: { tgId }
    })
    if (!account) {
       return null
      }

    let player = await this.prisma.player.findUnique({ 
      where: { 
          tgAccountId : account.id
      },
      include: {
          location: {
            include: { template : true }
          }
      }
    })
    if (!player) {
      return null
    }

    return player  
  }

  async createPlayer(createPlayerDto: CreatePlayerDto) : Promise<PlayerWithTgAccount> {

    const { tgAccount, referralCode, active } = createPlayerDto;

    const account = await this.prisma.telegramAccount.findUnique({
      where: { tgId: createPlayerDto.tgAccount.tgId },
    })

    if (account) {
      const existPlayer = await this.prisma.player.findUnique({
        where: { 
          tgAccountId : account.id
        },
        include: {
          tgAccount: true
        }
      })

      if (existPlayer) {
        return existPlayer
      }

      return this.prisma.player.create({
        data: {
          active: active ?? true,
          referralCode,
          unsafe: false,
          createdAt: new Date(),
          tgAccount: {
            connect: { id: account.id }
        },
      },
      include: {
        tgAccount: true, // Ensure the created TelegramAccount is included in the response
      }});
    
    }

    return this.prisma.player.create({
      data: {
        active: active ?? true,
        referralCode,
        tgAccount: {
          create: {
            username: tgAccount.username,
            tgId: tgAccount.tgId,
            firstName: tgAccount.firstName,
            lastName: tgAccount.lastName,
            imageUrl: tgAccount.imageUrl,
            isPremium: tgAccount.isPremium ?? false,
          },
        },
      },
      include: {
        tgAccount: true, // Ensure the created TelegramAccount is included in the response
      },
    });
  }
}