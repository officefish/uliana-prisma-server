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

  async getPlayerActionsByTgId(tgId: string)  {
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
            actions: true,
            received: true
        }
    })
    if (!player) {
      return null
    }
    return { actions: player.actions, received: player.received }  
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