import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';

import { Player, TelegramAccount } from '@prisma/client';

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
        const msg = `Player with tgId: ${tgId} not found.`
        this.logger.error(new Error(msg));
        throw new NotFoundException(msg);
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
      const msg = `Player with tgId: ${tgId} not found.`
      this.logger.error(new Error(msg));
      throw new NotFoundException(msg);
    }
    return player
  }

}